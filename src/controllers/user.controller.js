import { validateEmail, validatePassword } from '../utils/validator.util.js'
import sendMail from '../utils/mail.util.js'
import UserRepository from '../repository/user.repository.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ENVIROMENT from '../config/enviroment.js'

const QUERY = {
    VERIFICATION_TOKEN: 'verification_token'
}

export const createUser = async ({ username, email, password, verificationToken }) => {
    const nuevo_usuario = new User({
        username,
        email,
        password,
        verificationToken,
        modifiedAt: null
    })
    return nuevo_usuario.save()
}

export const findUserByEmail = async (email) => {
    const userFound = await User.findOne({ email: email })
    return userFound
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email)
        if (!user) {
            return res.json({
                ok: false,
                status: 400,
                message: 'Invalid email or password',
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({
                ok: false,
                status: 400,
                message: 'Invalid email or password',
            })
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.status(200).json({ message: 'Login successful', token })
    } catch (error) {
        res.json({
            ok: false,
            status: 500,
            message: 'Internal server error',
        })
    }
};


export const registerController = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password ) {
            return res.json({
                ok: false,
                status: 400,
                message: 'All fields are required.',
            });
        }


        if (!validateEmail(email)) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid email format.',
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                ok: false,
                message: "Password must be at least 8 characters long."
            });
        }
        

        const user_found = await UserRepository.findUserByEmail(email);

        if (user_found) {
            return res.status(400).json({
                ok: false,
                message: 'A user with this email already exists.',
            });
            
        }

        const verificationToken = jwt.sign({ email }, ENVIROMENT.SECRET_KEY_JWT, { expiresIn: '1d' });

        await sendMail({
            to: email,
            subject: 'Validate your email to continue on App Messaging!',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                    <div style="text-align: center; padding: 20px;">
                        <h1 style="color: #008060; font-size: 24px; margin-bottom: 10px;">App Messaging</h1>
                        <p style="font-size: 18px; color: #333333;">Confirm your email to get started.</p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); text-align: center;">
                        <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">
                            Click the button below to verify your email address:
                        </p>
                        <a href="${ENVIROMENT.URL_BACKEND}/users/verify-email?${QUERY.VERIFICATION_TOKEN}=${verificationToken}"
                           style="display: inline-block; background-color: #008060; color: white; font-size: 16px; font-weight: bold;
                                  padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                            Verify Email
                        </a>
                        <p style="font-size: 14px; color: #888888; margin-top: 20px;">
                            If you didn’t request this, you can ignore this email.
                        </p>
                    </div>
                </div>
            `,
        });


        const password_hash = await bcrypt.hash(password, 10);
        const newUser = await UserRepository.createUser({
            username,
            email,
            password: password_hash,
            verificationToken: verificationToken
        });


        return res.json({
            ok: true,
            status: 201,
            message: 'User registered successfully',
            data: {
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.json({
            ok: false,
            status: 500,
            message: 'Server error',
        });
    }
};
export const verifyEmailController = async (req, res) => {
    try {
        const { [QUERY.VERIFICATION_TOKEN]: verification_token } = req.query
        if (!verification_token) {
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=REQUEST_EMAIL_VERIFY_TOKEN`)

        }

        const payload = jwt.verify(verification_token, ENVIROMENT.SECRET_KEY_JWT)
        const user_to_verify = await UserRepository.findUserByEmail(payload.email)

        if (!user_to_verify) {
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=REQUEST_EMAIL_VERIFY_TOKEN`)
        }
        if (user_to_verify.verificationToken !== verification_token) {
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=RESEND_VERIFY_TOKEN`)
        }

        await UserRepository.verifyUser(user_to_verify._id)
        
        return res.redirect(`${ENVIROMENT.URL_FRONTEND}/login?verified=true`)
    }
    catch (error) {
        console.log(error)
        res.json({
            status: 500,
            message: "Internal server error",
            ok: false
        })
    }
}
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const errors = {
            email: null,
            password: null,
        };

        if (!email || !(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email))) {
            errors.email = "You must enter a valid value for email.";
        }

        if (!password) {
            errors.password = "You must enter a password.";
        }

        let hayErrores = false;
        for (let error in errors) {
            if (errors[error]) {
                hayErrores = true;
            }
        }

        if (hayErrores) {
            return res.json({
                message: "Errors exist!",
                ok: false,
                status: 400, 
                errors: errors,
            });
        }

        const user_found = await UserRepository.findUserByEmail(email);
        if (!user_found) {
            return res.json({
                ok: false,
                status: 404,
                message: "There is no user with this email.",
            });
        }

        const is_same_password = await bcrypt.compare(password, user_found.password);
        if (!is_same_password) {
            return res.json({
                ok: false,
                status: 400,
                message: "Wrong password. Please try again.",
            });
        }

        if (!user_found.isVerified) {
            return res.json({
                ok: false,
                status: 403,
                message: "Your email has not been verified. Please verify your email first.",
            });
        }

        const user_info = {
            id: user_found._id,
            name: user_found.name,
            username: user_found.username,
            email: user_found.email,
        };

        const access_token = jwt.sign(user_info, ENVIROMENT.SECRET_KEY_JWT);

        return res.json({
            ok: true,
            status: 200,
            message: "Logged in",
            data: {
                user_info,
                access_token,
            },
        });
    } catch (error) {
        console.error(error);
        return res.json({
            ok: false,
            message: "Internal server error",
            status: 500,
        });
    }
};

export const profileController = (req, res) => {
    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            username: req.user.username
        },
    });
    console.log(req.user);
};