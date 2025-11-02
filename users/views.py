from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .forms import RegisterForm  # Import a custom form
from django.contrib.auth import logout  
from django.shortcuts import redirect

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)  # Using a custom form
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
        else:
            return render(request, 'registration/register.html', {'form': form})
    else:
        form = RegisterForm()  # Using a custom form
        return render(request, 'registration/register.html', {'form': form})
    

def instant_logout(request):
    logout(request)
    return redirect('post_list')