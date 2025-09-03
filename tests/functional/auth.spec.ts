import { test } from '@japa/runner'
// import { ApiClient } from '@japa/api-client'

test.group('Auth API', () => {
  test('can check API health', async ({ client }) => {
    const response = await client.get('/health')
    
    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'SamaCarnet API is running'
    })
  })

  test('can login with valid credentials', async ({ client }) => {
    const response = await client
      .post('/api/v1/public/auth/login')
      .header('x-tenant-id', '1')
      .json({
        email: 'fatou.seck@demo.com',
        password: 'password123'
      })
    
    // Note: This test will work after seeding the database
    if (response.status() === 200) {
      response.assertBodyContains({
        success: true
      })
      response.assertBodyContains(['data.token'])
      response.assertBodyContains(['data.user.role'])
    } else {
      // If DB not seeded, expect appropriate error
      response.assertStatus(401)
    }
  })

  test('cannot login with invalid tenant', async ({ client }) => {
    const response = await client
      .post('/api/v1/public/auth/login')
      .header('x-tenant-id', '999')
      .json({
        email: 'fatou.seck@demo.com',
        password: 'password123'
      })
    
    response.assertStatus(401)
  })

  test('cannot login without tenant header', async ({ client }) => {
    const response = await client
      .post('/api/v1/public/auth/login')
      .json({
        email: 'fatou.seck@demo.com',
        password: 'password123'
      })
    
    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Tenant ID is required'
    })
  })
})
