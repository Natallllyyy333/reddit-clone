from django.shortcuts import render, redirect

def home(request):
    # Перенаправляем на список постов как главную страницу
    return redirect('post_list')