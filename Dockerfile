FROM node:18.17.0 as vue
COPY static /vue
RUN cd vue && npm i && npm run build

FROM ghcr.io/inkroomtemp/rust_musl_build as rust
WORKDIR /
RUN rm -rf /app && cargo new app
COPY ./Cargo.toml /app/
WORKDIR /app
RUN cargo build --release -vv --target=$(arch)-unknown-linux-musl && rm -rf src/main.rs && rm -rf /app/target/$(arch)-unknown-linux-musl/release/deps/app-* 

COPY . /app
RUN rm -rf static
COPY --from=vue /vue/dist /app/static
RUN cargo build --release -vv --target=$(arch)-unknown-linux-musl && mv target/$(arch)-unknown-linux-musl/release/app target/app && chmod +x target/app

FROM alpine
COPY --from=rust /app/target/app /app

EXPOSE 25895

ENTRYPOINT ["/app"]
