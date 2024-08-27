from rest_framework import serializers
from .models import User, Form, Preset, FormResponse, FormField
from collections import OrderedDict

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'is_admin')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(validated_data['username'], validated_data['email'], validated_data['password'])
        user.is_admin = validated_data.get('is_admin', False)
        user.save()
        return user
    
class FormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = '__all__'
        read_only_fields = ('created_by',)

    def to_representation(self, instance):
        """Convert the `form_structure` field to an OrderedDict when returning data."""
        representation = super().to_representation(instance)
        if 'form_structure' in representation and isinstance(representation['form_structure'], dict):
            representation['form_structure'] = OrderedDict(representation['form_structure'])
        return representation

    def to_internal_value(self, data):
        """Convert the `form_structure` field to an OrderedDict when receiving data."""
        if 'form_structure' in data and isinstance(data['form_structure'], dict):
            data['form_structure'] = OrderedDict(data['form_structure'])
        return super().to_internal_value(data)

class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = '__all__'


class PresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preset
        fields = '__all__'

class FormResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormResponse
        fields = '__all__'

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
