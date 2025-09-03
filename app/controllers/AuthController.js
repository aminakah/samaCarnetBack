const { hash, compare } = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  /**
   * Connexion utilisateur avec détection automatique du tenant
   */
  async login({ request, response }) {
    try {
      const { email, password } = request.only(['email', 'password']);

      // Validation des champs requis
      if (!email || !password) {
        return response.status(400).json({
          success: false,
          message: 'Email et mot de passe requis',
          errors: {
            email: !email ? 'Email requis' : undefined,
            password: !password ? 'Mot de passe requis' : undefined
          }
        });
      }

      // Rechercher l'utilisateur par email
      const user = await User.query()
        .where('email', email)
        .where('is_active', true)
        .first();

      if (!user) {
        return response.status(401).json({
          success: false,
          message: 'Identifiants incorrects'
        });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return response.status(401).json({
          success: false,
          message: 'Identifiants incorrects'
        });
      }

      // Détecter automatiquement le type d'utilisateur et assigner le tenant
      const { tenantId, isSuperAdmin } = this.determineTenantFromEmail(email);
      
      // Mettre à jour le tenant de l'utilisateur si nécessaire
      if (user.tenant_id !== tenantId) {
        await user.merge({ tenant_id: tenantId }).save();
        user.tenant_id = tenantId;
      }

      // Mettre à jour la dernière connexion
      await user.merge({ last_login: new Date() }).save();

      // Générer les tokens JWT
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Préparer les données utilisateur (sans le mot de passe)
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        tenantId: user.tenant_id,
        phone: user.phone,
        isActive: user.is_active,
        preferredLanguage: user.preferred_language || 'fr',
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
        isSuperAdmin
      };

      return response.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: userData,
          tokens: {
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
          }
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return response.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Détermine automatiquement le tenant basé sur l'email
   */
  determineTenantFromEmail(email) {
    // Patterns pour détecter les super administrateurs
    const superAdminPatterns = [
      '@superadmin.',
      'super@',
      'global@',
      'system@',
      'dev@samacarnet.sn',
      'admin@samacarnet.sn'
    ];

    const emailLower = email.toLowerCase();
    const isSuperAdmin = superAdminPatterns.some(pattern => 
      emailLower.includes(pattern.toLowerCase())
    );

    if (isSuperAdmin) {
      return {
        tenantId: 'global',
        isSuperAdmin: true
      };
    }

    // Pour les utilisateurs normaux, détecter le tenant depuis le domaine email
    // Exemple: user@dakar-health.sn -> tenant basé sur le domaine
    const emailParts = email.split('@');
    if (emailParts.length === 2) {
      const domain = emailParts[1];
      
      // Mapping des domaines vers les tenants
      const domainToTenant = {
        'dakar-health.sn': '1',
        'almadies-clinic.sn': '2',
        'thies-hospital.sn': '3',
        'clinic.sn': '1', // Domaine générique
        'hospital.sn': '1'
      };

      const tenantId = domainToTenant[domain] || '1'; // Défaut tenant 1

      return {
        tenantId,
        isSuperAdmin: false
      };
    }

    // Par défaut, assigner au tenant 1
    return {
      tenantId: '1',
      isSuperAdmin: false
    };
  }

  /**
   * Génère un token d'accès JWT
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      type: 'access'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'samacarnet-secret', {
      expiresIn: '30m'
    });
  }

  /**
   * Génère un token de rafraîchissement JWT
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'samacarnet-refresh-secret', {
      expiresIn: '7d'
    });
  }

  /**
   * Déconnexion utilisateur
   */
  async logout({ auth, response }) {
    try {
      // Dans une vraie application, on ajouterait le token à une blacklist
      return response.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return response.status(500).json({
        success: false,
        message: 'Erreur lors de la déconnexion'
      });
    }
  }

  /**
   * Rafraîchissement du token d'accès
   */
  async refresh({ request, response }) {
    try {
      const { refreshToken } = request.only(['refreshToken']);

      if (!refreshToken) {
        return response.status(400).json({
          success: false,
          message: 'Token de rafraîchissement requis'
        });
      }

      // Vérifier le refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'samacarnet-refresh-secret');
      
      if (decoded.type !== 'refresh') {
        throw new Error('Type de token invalide');
      }

      // Rechercher l'utilisateur
      const user = await User.find(decoded.userId);
      if (!user || !user.is_active) {
        return response.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé ou inactif'
        });
      }

      // Générer un nouveau token d'accès
      const newAccessToken = this.generateAccessToken(user);

      return response.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        }
      });

    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      return response.status(401).json({
        success: false,
        message: 'Token de rafraîchissement invalide'
      });
    }
  }

  /**
   * Validation de session
   */
  async validateSession({ auth, response }) {
    try {
      const user = await auth.getUser();
      
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        tenantId: user.tenant_id,
        phone: user.phone,
        isActive: user.is_active,
        preferredLanguage: user.preferred_language || 'fr',
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      };

      return response.status(200).json({
        success: true,
        data: userData
      });

    } catch (error) {
      return response.status(401).json({
        success: false,
        message: 'Session invalide'
      });
    }
  }
}

module.exports = AuthController;