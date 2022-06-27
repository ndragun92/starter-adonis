import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      return await auth.use('api').attempt(email, password, {
        expiresIn: '7days',
      })
    } catch {
      return response.badRequest('Invalid credentials')
    }
  }

  public async register({ request, response }: HttpContextContract) {
    /**
     * Validate user details
     */
    const validationSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({ trim: true }, [rules.confirmed()]),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
    })

    const user = new User()

    for (const [key, value] of Object.entries(validatedData)) {
      user[key] = value
    }

    await user.save()

    return response.ok(user)
  }
}
