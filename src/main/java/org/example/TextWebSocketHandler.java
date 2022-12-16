package org.example;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.handler.codec.http.websocketx.*;
import io.netty.util.CharsetUtil;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import static io.netty.handler.codec.http.HttpUtil.isKeepAlive;

/**
 * @author inkbox
 * @since 2022/12/15
 */
public class TextWebSocketHandler extends SimpleChannelInboundHandler<TextWebSocketFrame> {

    private static List<Channel> channels = new LinkedList<>();

    @Override
    protected void channelRead0(ChannelHandlerContext channelHandlerContext, TextWebSocketFrame textWebSocketFrame) throws Exception {
        System.out.println(textWebSocketFrame);
        System.out.println(textWebSocketFrame.text());
        for (int i = 0; i < channels.size(); i++) {
            System.out.println("广播 " + i + "  " + textWebSocketFrame.text());
            channels.get(i).writeAndFlush(new TextWebSocketFrame(textWebSocketFrame.text()));
        }

    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        super.channelReadComplete(ctx);
    }

    @Override
    public void channelRegistered(ChannelHandlerContext ctx) throws Exception {
        super.channelRegistered(ctx);
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {

        channels.add(ctx.channel());
        System.out.println("添加连接  当前 一共= " + channels.size());
//        ctx.channel().writeAndFlush(new TextWebSocketFrame("{\"type\":\"up\",\"count\":" + channels.size() + "}"));
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        channels.remove(ctx.channel());
        System.out.println("移除连接  当前 一共= " + channels.size());
        for (int i = 0; i < channels.size(); i++) {
            channels.get(i).writeAndFlush(new TextWebSocketFrame("{\"type\":\"up\",\"count\":" + channels.size() + "}"));
        }
//        ctx.channel().writeAndFlush(new TextWebSocketFrame("{\"type\":\"up\",\"count\":" + channels.size() + "}"));
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {

        cause.printStackTrace();
    }
}
