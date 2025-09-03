const express = require('express');
const router = express.Router();
const AuthController = require('../app/controllers/AuthController');
const AuthMiddleware = require('../app/middleware/AuthMiddleware');

const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// Routes publiques (sans authentification)
router.post('/login', async (req, res) => {
  const request = { only: (fields) => {
    const result = {};
    fields.forEach(field => {
      if (req.body[field]) result[field] = req.body[field];
    });
    return result;
  }};
  
  await authController.login({ request, response: res });
});

router.post('/refresh', async (req, res) => {
  const request = { only: (fields) => {
    const result = {};
    fields.forEach(field => {
      if (req.body[field]) result[field] = req.body[field];
    });
    return result;
  }};
  
  await authController.refresh({ request, response: res });
});

// Routes protégées (avec authentification)
router.post('/logout', async (req, res, next) => {
  await authMiddleware.handle({ request: req, response: res }, async () => {
    await authController.logout({ auth: req.auth, response: res });
  });
});

router.get('/me', async (req, res, next) => {
  await authMiddleware.handle({ request: req, response: res }, async () => {
    await authController.validateSession({ auth: req.auth, response: res });
  });
});

// Route de test pour vérifier l'authentification
router.get('/test', async (req, res, next) => {
  await authMiddleware.handle({ request: req, response: res }, async () => {
    res.json({
      success: true,
      message: 'Authentification réussie',
      user: req.user,
      auth: req.auth
    });
  });
});

module.exports = router;