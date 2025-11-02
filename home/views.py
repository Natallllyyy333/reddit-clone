from django.shortcuts import render, redirect

def home(request):
    # Redirecting to the list of posts as the main page
    return redirect('post_list')