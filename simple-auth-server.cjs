const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3333;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Utilisateurs de test simples
const users = [
  {
    id: '1',
    email: 'dev@samacarnet.sn',
    // password123 hashé
    password: '$2b$10$NwGKJvAf4a4y4Rk79Y2mAup9QTgrqGeRaraU0dUq.iCzS.OtAptvC',
    firstName: 'Super Admin',
    lastName: 'Test',
    role: 'admin',
    tenantId: 'global',
    phone: '+221 77 000 00 00',
    isActive: true,
    preferredLanguage: 'fr',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null
  },
  {
    id: '2',
    email: 'user@clinic.sn',
    password: '$2b$10$NwGKJvAf4a4y4Rk79Y2mAup9QTgrqGeRaraU0dUq.iCzS.OtAptvC',
    firstName: 'Admin',
    lastName: 'Tenant',
    role: 'admin',
    tenantId: '1',
    phone: '+221 77 000 00 01',
    isActive: true,
    preferredLanguage: 'fr',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null
  }
];

// Fonction pour détecter le superAdmin
function determineTenantFromEmail(email) {
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
  const emailParts = email.split('@');
  if (emailParts.length === 2) {
    const domain = emailParts[1];
    
    const domainToTenant = {
      'dakar-health.sn': '1',
      'almadies-clinic.sn': '2',
      'thies-hospital.sn': '3',
      'clinic.sn': '1',
      'hospital.sn': '1'
    };

    const tenantId = domainToTenant[domain] || '1';

    return {
      tenantId,
      isSuperAdmin: false
    };
  }

  return {
    tenantId: '1',
    isSuperAdmin: false
  };
}

// Route de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, tenantId: requestedTenantId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Utiliser le tenant fourni ou le détecter automatiquement
    let finalTenantId, isSuperAdmin;
    if (requestedTenantId) {
      // Si un tenant est fourni, l'utiliser
      finalTenantId = requestedTenantId;
      isSuperAdmin = requestedTenantId === 'global';
      console.log('Tenant fourni par le client:', { email, tenantId: finalTenantId, isSuperAdmin });
    } else {
      // Sinon, détecter automatiquement
      const detected = determineTenantFromEmail(email);
      finalTenantId = detected.tenantId;
      isSuperAdmin = detected.isSuperAdmin;
      console.log('Tenant détecté automatiquement:', { email, tenantId: finalTenantId, isSuperAdmin });
    }

    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Mettre à jour le tenant si nécessaire
    if (user.tenantId !== finalTenantId) {
      user.tenantId = finalTenantId;
    }

    user.lastLogin = new Date();

    // Générer un token simple
    const token = `token_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      data: {
        token,
        user: {
          ...user,
          isSuperAdmin,
          password: undefined // Ne pas renvoyer le mot de passe
        }
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SamaCarnet Auth Server is running',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SamaCarnet Auth Server démarré sur le port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});