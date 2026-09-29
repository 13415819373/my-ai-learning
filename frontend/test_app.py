import os
import gradio as gr

def chat(question):
    return "测试回复：" + question

gr.Interface(fn=chat, inputs="text", outputs="text", title="测试").launch()
