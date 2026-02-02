import dotenv from 'dotenv'
import bcryptjs from 'bcryptjs'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const reset = async () => {
  try {
    await connectDB()

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jagoindia.com').toLowerCase()
    const newPassword = process.env.ADMIN_PASSWORD || 'admin123456'

    const user = await User.findOne({ email: adminEmail })
    if (!user) {
      console.log(`❌ No user found with email ${adminEmail}`)
      process.exit(1)
    }

    // Hash the new password once and update directly (avoid pre-save double-hash)
    const salt = await bcryptjs.genSalt(10)
    const hashed = await bcryptjs.hash(newPassword, salt)

    await User.updateOne({ email: adminEmail }, { $set: { password: hashed } })

    console.log('✅ Admin password has been reset successfully.')
    console.log(`Email: ${adminEmail}\nPassword: ${newPassword}`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error resetting admin password:', err.message)
    process.exit(1)
  }
}

reset()
