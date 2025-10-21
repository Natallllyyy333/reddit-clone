from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Аккаунт создан для {username}!')
            return redirect('login')
        else:
            # Если форма невалидна, показываем ошибки
            return render(request, 'users/register.html', {'form': form})
    else:
        # GET запрос - показываем пустую форму
        form = UserCreationForm()
        return render(request, 'users/register.html', {'form': form})