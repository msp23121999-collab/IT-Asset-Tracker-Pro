from flask import jsonify, g
from functools import wraps

def role_required(allowed_roles):
    """
    Decorator to restrict access to specific user roles.
    Allowed roles should be a list of UserRole strings, e.g. ['super_admin', 'it_admin'].
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # Check if user object is populated in Flask global context
            if not hasattr(g, 'user') or not g.user:
                return jsonify({'message': 'Authentication required!'}), 401
                
            user_role = g.user.get('role')
            
            # Verify if user's role is permitted for this endpoint
            if user_role not in allowed_roles:
                return jsonify({
                    'message': 'Access forbidden: Insufficient security privileges!',
                    'required_roles': allowed_roles,
                    'user_role': user_role
                }), 403
                
            return f(*args, **kwargs)
        return decorated
    return decorator
