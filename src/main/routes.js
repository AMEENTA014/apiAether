import {Router} from "oak";
import middleWares from "./middleWare.js";
import controllers from "./controller.js";
export const fileRouter = new Router();
export const symptomRouter = new Router();
export const authRouter = new Router();
authRouter.post('/logout',middleWares.authenticate,controllers.logoutUserController)
authRouter.post('/forgotPass',middleWares.errorHandler,controllers.forgotPasswordController);
authRouter.post('/signUp',middleWares.errorHandler,controllers.signUpUserController);
authRouter.post('/verify',middleWares.errorHandler,controllers.verifyController);
authRouter.post('/login', middleWares.errorHandler,controllers.loginUserController);
authRouter.post('/resetPassword',middleWares.errorHandler, middleWares.authenticate, controllers.resetPasswordController);
authRouter.post('/resetPassVerify', middleWares.errorHandler,controllers.verifyResetPasswordController);
authRouter.put('/update', middleWares.errorHandler,middleWares.authenticate, controllers.updateUserController);
authRouter.delete('/delete',middleWares.errorHandler,middleWares.authenticate,controllers.deleteUserController);
authRouter.get('/getAllUsers',middleWares.errorHandler,middleWares.authenticate,controllers.getAllUserController);
authRouter.get('/getUser',middleWares.errorHandler,middleWares.authenticate,controllers.getUserData);
//authRouter.post('/gSignIn',userController.googleSignInController);

// File routes
fileRouter.post('/createFile', middleWares.errorHandler, middleWares.authenticate, controllers.createFileController);
fileRouter.get('/getFileById/:fileId', middleWares.errorHandler, middleWares.authenticate, controllers.getFileController);
fileRouter.get('/getFilesByUserId', middleWares.errorHandler, middleWares.authenticate, controllers.getUserFilesController);
fileRouter.get('/getAllFiles', middleWares.errorHandler, middleWares.authenticate, controllers.getAllFilesController);
fileRouter.put('/updateFile/:fileId', middleWares.errorHandler, middleWares.authenticate, controllers.updateFileController);
fileRouter.delete('/deleteFile/:fileId', middleWares.errorHandler, middleWares.authenticate, controllers.deleteFileController);
fileRouter.get('/getFileByUuid/:fileuuid', middleWares.errorHandler, middleWares.authenticate, controllers.getFileByUuidController);


//
symptomRouter.post('/createSymptom', middleWares.errorHandler, middleWares.authenticate, controllers.createSymptomController);
symptomRouter.get('/getSymptomById/:symptomId', middleWares.errorHandler, middleWares.authenticate, controllers.getSymptomController);
symptomRouter.get('/getSymptomsByUserId', middleWares.errorHandler, middleWares.authenticate, controllers.getUserSymptomsController);
symptomRouter.get('/getAllSymptoms', middleWares.errorHandler, middleWares.authenticate, controllers.getAllSymptomsController);
symptomRouter.put('/updateSymptom/:symptomId', middleWares.errorHandler, middleWares.authenticate, controllers.updateSymptomController);
symptomRouter.delete('/deleteSymptom/:symptomId', middleWares.errorHandler, middleWares.authenticate, controllers.deleteSymptomController);


