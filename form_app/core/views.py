from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, logout
from .models import Formulaire
from .serializers import FormulaireSerializer
from .models import FormsResponse
from .serializers import FormsResponseSerializer
from .models import User, Form, Preset, FormResponse, FormField
from rest_framework.permissions import AllowAny
from collections import OrderedDict
from .serializers import UserSerializer, FormSerializer, PresetSerializer, FormResponseSerializer, RegisterSerializer
from django.contrib.auth import update_session_auth_hash
from .serializers import ChangePasswordSerializer, FormSerializer, FormFieldSerializer
from rest_framework import generics, status
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    print("Request data:", request.data)  # Log request data
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        print("Username or password missing")
        return Response({'error': 'Username and password are required'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        print("User authenticated successfully:", user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })
    else:
        print("Invalid credentials for username:", username)
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response({
        'is_admin': user.is_superuser,
        'username': user.username,
        'email': user.email,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()

        logout(request)
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,  # This field is managed in the serializer.
            identifier=None  # This field is managed in the serializer.
        )

    def perform_update(self, serializer):
        serializer.save(
            created_by=self.request.user,  # This field is managed in the serializer.
            identifier=None  # This field is managed in the serializer.
        )


class FormulaireViewSet(viewsets.ModelViewSet):
    queryset = Formulaire.objects.all()
    serializer_class = FormulaireSerializer

class PresetViewSet(viewsets.ModelViewSet):
    queryset = Preset.objects.all()
    serializer_class = PresetSerializer

class FormResponseViewSet(viewsets.ModelViewSet):
    queryset = FormResponse.objects.all()
    serializer_class = FormResponseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        form_id = self.request.query_params.get('form')
        if form_id:
            queryset = queryset.filter(form_id=form_id)
        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
class FormFieldViewSet(viewsets.ModelViewSet):
    queryset = FormField.objects.all()
    serializer_class = FormFieldSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_form(request, pk):
    try:
        form = Form.objects.get(pk=pk)
        return Response(FormSerializer(form).data)
    except Form.DoesNotExist:
        return Response({'error': 'Form not found'}, status=404)
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_object()
        old_password = serializer.validated_data.get('old_password')
        new_password = serializer.validated_data.get('new_password')
        
        if not user.check_password(old_password):
            return Response({'error': 'Old password is not correct'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_form(request):
    forms = Form.objects.all()
    serializer = FormSerializer(forms, many=True)
    return Response(serializer.data)


    

class FormsResponseViewSet(viewsets.ModelViewSet):
    queryset = FormsResponse.objects.all()
    serializer_class = FormsResponseSerializer

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            form_response = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      # This method is used by default for DELETE requests
    # Use a URL parameter to handle deletion
     # Optional: Override the destroy method for custom behavior
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()

