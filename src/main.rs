use std::collections::HashMap;
use std::sync::atomic::{AtomicUsize, Ordering};

use futures_util::{FutureExt, StreamExt};
use once_cell::sync::Lazy;
use salvo::http::response;
use salvo::server::ServerHandle;
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;

use salvo::prelude::*;
use salvo::websocket::{Message, WebSocket, WebSocketUpgrade};
use tracing_subscriber::fmt::format;
use rust_embed::RustEmbed;
use salvo::serve_static::static_embed;

#[derive(RustEmbed)]
#[folder = "static"]
struct Assets;
type Users = RwLock<HashMap<usize, mpsc::UnboundedSender<Result<Message, salvo::Error>>>>;

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
static ONLINE_USERS: Lazy<Users> = Lazy::new(Users::default);

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    

    let router = Router::new()
        .push(Router::with_path("sw").goal(user_connected))
        .push(Router::with_path("sudoku").push(Router::with_path("new").get(sudoku_new)))
        .push(Router::with_path("<**path>").get(static_embed::<Assets>().fallback("index.html")))
;


    let acceptor = TcpListener::new("0.0.0.0:25895").bind().await;

    let server = Server::new(acceptor);
    let handle = server.handle();
    tokio::spawn(shutdown_signal(handle));
    server.serve(router).await;

}

#[handler]
async fn sudoku_new(req: &mut Request, res: &mut Response) -> Result<(), StatusError> {
    let response = tinyget::get("https://sudoku.com/api/level/expert?mode=killer")
        .with_header("Referer", "https://sudoku.com/zh/killer/zhuanjia/")
        .with_header(
            "User-Agent",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0",
        )
        .with_header("X-Requested-With", "XMLHttpRequest")
        .send()
      ;
    match response {
        Ok(r) => {
            if let Ok(data) = r.as_str() {
                res.render(format!("{}", data));
            } else {
                res.status_code(StatusCode::INTERNAL_SERVER_ERROR);
            }
        },
        Err(e) => {
            eprintln!("{}",e);
            res.render(StatusError::internal_server_error().brief(format!("{}",e)))
        },
    }



   

    Ok(())
}

#[handler]
async fn user_connected(req: &mut Request, res: &mut Response) -> Result<(), StatusError> {
    WebSocketUpgrade::new()
        .upgrade(req, res, handle_socket)
        .await
}
async fn handle_socket(ws: WebSocket) {
    // Use a counter to assign a new unique ID for this user.
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

    tracing::info!("new chat user: {}", my_id);
    user_message(
        my_id,
        Message::text(format!(
            "{{\"type\":\"up\",\"count\":{}}}",
            ONLINE_USERS.write().await.len()
        )),
    )
    .await;

    // Split the socket into a sender and receive of messages.
    let (user_ws_tx, mut user_ws_rx) = ws.split();

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the websocket...
    let (tx, rx) = mpsc::unbounded_channel();
    let rx = UnboundedReceiverStream::new(rx);
    let fut = rx.forward(user_ws_tx).map(|result| {
        if let Err(e) = result {
            tracing::error!(error = ?e, "websocket send error");
        }
    });
    tokio::task::spawn(fut);
    let fut = async move {
        ONLINE_USERS.write().await.insert(my_id, tx);

        while let Some(result) = user_ws_rx.next().await {
            let msg = match result {
                Ok(msg) => msg,
                Err(e) => {
                    eprintln!("websocket error(uid={}): {}", my_id, e);
                    break;
                }
            };
            user_message(my_id, msg).await;
        }

        user_disconnected(my_id).await;
    };
    tokio::task::spawn(fut);
}
async fn user_message(my_id: usize, msg: Message) {
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    let new_msg = format!("{}", msg);

    // New message from this user, send it to everyone else (except same uid)...
    for (&uid, tx) in ONLINE_USERS.read().await.iter() {
        // if my_id != uid {
        if let Err(_disconnected) = tx.send(Ok(Message::text(new_msg.clone()))) {
            // The tx is disconnected, our `user_disconnected` code
            // should be happening in another task, nothing more to
            // do here.
        }
        // }
    }
}

async fn user_disconnected(my_id: usize) {
    eprintln!("good bye user: {}", my_id);
    // Stream closed up, so remove from the user list
    ONLINE_USERS.write().await.remove(&my_id);
    NEXT_USER_ID.fetch_sub(1, Ordering::Relaxed);

    user_message(
        my_id,
        Message::text(format!(
            "{{\"type\":\"down\",\"count\":{}}}",
            ONLINE_USERS.write().await.len()
        )),
    )
    .await;
}


async fn shutdown_signal(handle: ServerHandle) {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
    handle.stop_graceful(std::time::Duration::from_secs(1));
}

