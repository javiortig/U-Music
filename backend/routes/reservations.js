const express = require("express")
const router = express.Router()

const {updateReservation,deleteReservation, addReservation, getAllReservationsFromActivity,getReservationsFromAdmin,reserveClassroom,acceptOrRejectClassroom} = require("../controllers/reservations")
const {authMiddleware,utadValidationMiddleware} = require("../middleware/authMiddleware")
const {validateAddReservation, validateUpdateReservation,validateReserveClassroom} = require("../validators/reservations")

//ID DE LA ACTIVIDAD DE LA QUE SE QUIEREN OBTENER LAS RESERVAS
router.get("/getAllReservationsFromActivity/:id", authMiddleware,getAllReservationsFromActivity) 

//TODAS LAS RESERVAS DÓNDE UN USUARIO ES ADMIN
router.get("/getReservationsFromAdmin", authMiddleware,getReservationsFromAdmin)

//ID DE LA RESERVA QUE SE VA A ACTUALIZAR
router.put("/updateReservation/:id", validateUpdateReservation, authMiddleware,updateReservation) 

// ID DE LA ACTIVIDAD A LA QUE SE VA A AÑADIR LA RESERVA
router.post("/addReservation/:id", validateAddReservation, authMiddleware,addReservation)

// ID DE LA RESERVA QUE SE VA A ACEPTAR O RECHAZAR
router.put("/acceptOrRejectClassroom/:id", utadValidationMiddleware,acceptOrRejectClassroom)

// ID DE LA RESERVA QUE SE VA A ACTUALIZAR SU AULA
router.put("/reserveClassroom/:id", validateReserveClassroom, authMiddleware,reserveClassroom)

// ID DE LA RESERVA QUE SE VA A ELIMINAR
router.delete("/deleteReservation/:id", authMiddleware,deleteReservation) 

module.exports = router