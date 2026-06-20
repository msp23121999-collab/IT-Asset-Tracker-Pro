from flask import request, jsonify, g
from functools import wraps
import firebase_admin
from firebase_admin import auth, firestore

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check for Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization'].split(" ")
            if len(auth_header) == 2 and auth_header[0] == 'Bearer':
                token = auth_header[1]

        if not token:
            return jsonify({'message': 'Authorization token is missing!'}), 401

        # Check for Mock Token fallback
        if token.startswith('mock-'):
            # Parse mock user details
            uid = token
            role = 'employee'
            email = 'employee@company.com'
            name = 'Demo Employee'
            department = 'Engineering'

            if 'superadmin' in token:
                role = 'super_admin'
                email = 'superadmin@company.com'
                name = 'Demo Super Admin'
                department = 'IT Support'
            elif 'itadmin' in token:
                role = 'it_admin'
                email = 'itadmin@company.com'
                name = 'Demo IT Admin'
                department = 'IT Support'
            elif token.startswith('mock-emp-'):
                emp_id = token.replace('mock-emp-', '')
                role = 'employee'
                email = f'emp.{emp_id}@company.com'
                name = f'Employee {emp_id}'

            g.user = {
                'uid': uid,
                'email': email,
                'displayName': name,
                'role': role,
                'department': department,
                'is_mock': True
            }
            return f(*args, **kwargs)

        # Real Firebase token validation
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            # Fetch user profile from Firestore
            db = firestore.client()
            user_ref = db.collection('users').document(uid)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                g.user = {
                    'uid': uid,
                    'email': decoded_token.get('email', ''),
                    'displayName': user_data.get('displayName', 'User'),
                    'role': user_data.get('role', 'employee'),
                    'department': user_data.get('department', 'General'),
                    'is_mock': False
                }
            else:
                # Fallback profile if doc does not exist
                g.user = {
                    'uid': uid,
                    'email': decoded_token.get('email', ''),
                    'displayName': decoded_token.get('name', 'User'),
                    'role': 'employee',
                    'department': 'General',
                    'is_mock': False
                }
        except Exception as e:
            return jsonify({'message': 'Authorization token is invalid!', 'error': str(e)}), 401

        return f(*args, **kwargs)

    return decorated
