const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthMiddleware {
  /**
   * Middleware d'authentification JWT
   */
  async handle({ request, response }, next) {
    try {
      // Récupérer le token depuis l'header Authorization
      const authHeader = request.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({
          success: false,
          message: 'Token d\'authentification requis'
        });
      }

      const token = authHeader.substring(7); // Supprimer "Bearer "

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'samacarnet-secret');
      
      if (decoded.type !== 'access') {
        throw new Error('Type de token invalide');
      }

      // Rechercher l'utilisateur
      const user = await User.query()
        .where('id', decoded.userId)
        .where('is_active', true)
        .first();

      if (!user) {
        return response.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé ou inactif'
        });
      }

      // Ajouter l'utilisateur au contexte de la requête
      request.user = user;
      request.auth = {
        user,
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role
      };

      await next();

    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      
      let message = 'Token invalide';
      if (error.name === 'TokenExpiredError') {
        message = 'Token expiré';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Token malformé';
      }

      return response.status(401).json({
        success: false,
        message
      });
    }
  }
}

module.exports = AuthMiddleware;