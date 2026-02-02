import dotenv from 'dotenv'
import bcryptjs from 'bcryptjs'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const updateAdmin = async () => {
  try {
    await connectDB()

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jagoindia.com').toLowerCase()
    const adminName = process.env.ADMIN_NAME || 'AMIT RAJWAR'
    const newPassword = process.env.ADMIN_PASSWORD || 'amitxanjali@2025'

    const user = await User.findOne({ email: adminEmail })
    if (!user) {
      console.log(`❌ No user found with email ${adminEmail}`)
      process.exit(1)
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10)
    const hashed = await bcryptjs.hash(newPassword, salt)

    // Update both name and password
    await User.updateOne(
      { email: adminEmail },
      { 
        $set: { 
          name: adminName,
          password: hashed 
        } 
      }
    )

    console.log('✅ Admin user updated successfully.')
    console.log(`Name: ${adminName}\nEmail: ${adminEmail}\nPassword: ${newPassword}`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error updating admin user:', err.message)
    process.exit(1)
  }
}

updateAdmin()
