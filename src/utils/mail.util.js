import ENVIROMENT from "../config/enviroment.js";
import transporter from "../config/mail.config.js";
const sendMail = async ({to, subject, html}) => {
    try {
        const data = await transporter.sendMail({
            from: ENVIROMENT.EMAIL_USERNAME,
            to,
            subject,
            html
        })

        return data
    } 
    
    catch (error) {
        console.log('Error sending mail: ',error);
    }
}

export default sendMail;