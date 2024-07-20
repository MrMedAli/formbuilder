from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, logout
from .models import User, Form, Preset, FormResponse
from .serializers import UserSerializer, FormSerializer, PresetSerializer, FormResponseSerializer, RegisterSerializer

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
    permission_classes = [IsAdminUser]

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


