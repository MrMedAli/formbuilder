from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, logout
from .models import User, Form, Preset, FormResponse
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer, FormSerializer, PresetSerializer, FormResponseSerializer, RegisterSerializer
from django.contrib.auth import update_session_auth_hash
from .serializers import ChangePasswordSerializer
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
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_form_response(request, pk):
    try:
        form = Form.objects.get(pk=pk)
        response_data = request.data.get('response_data')
        FormResponse.objects.create(form=form, user=request.user, response_data=response_data)
        return Response({'message': 'Form response submitted successfully'})
    except Form.DoesNotExist:
        return Response({'error': 'Form not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_form_response(request, pk):
    try:
        response = FormResponse.objects.get(pk=pk)
        response.delete()
        return Response({'message': 'Response deleted successfully'})
    except FormResponse.DoesNotExist:
        return Response({'error': 'Response not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    


