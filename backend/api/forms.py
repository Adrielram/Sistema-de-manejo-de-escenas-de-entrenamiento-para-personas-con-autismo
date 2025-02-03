from django import forms
from .models import User

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['dni', 'nombre', 'fecha_nac', 'genero', 'role', 'direccion_id_dir', 'email']
        widgets = {
            'fecha_nac': forms.DateInput(attrs={'type': 'date'}),
        }
