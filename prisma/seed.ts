import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Limpiar bd
  await prisma.cita.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.role.deleteMany();

  // Roles
  const adminRole = await prisma.role.create({
    data: { nombre: "Administrador", descripcion: "Control total" },
  });
  const medicoRole = await prisma.role.create({
    data: { nombre: "Medico", descripcion: "Acceso a consultas" },
  });
  const pacienteRole = await prisma.role.create({
    data: { nombre: "Paciente", descripcion: "Acceso a su expediente" },
  });

  // Passwords
  const hashAdmin = await bcrypt.hash("admin123", 10);
  const hashMedico = await bcrypt.hash("doctor123", 10);
  const hashPaciente = await bcrypt.hash("paciente123", 10);

  // Usuarios
  await prisma.usuario.create({
    data: {
      nombre: "Admin Ejecutivo",
      email: "admin@medisystem.com",
      password: hashAdmin,
      rol_id: adminRole.id_rol,
    },
  });

  const usuarioMedico = await prisma.usuario.create({
    data: {
      nombre: "Dr. Roberto Gómez",
      email: "medico@medisystem.com",
      password: hashMedico,
      rol_id: medicoRole.id_rol,
    },
  });

  const usuarioPaciente = await prisma.usuario.create({
    data: {
      nombre: "Carlos López",
      email: "paciente@medisystem.com",
      password: hashPaciente,
      rol_id: pacienteRole.id_rol,
    },
  });

  // Médicos
  const medico = await prisma.medico.create({
    data: {
      nombre: "Dr. Roberto Gómez",
      especialidad: "Pediatría",
      cedula_profesional: "MED-123456",
      email: "medico@medisystem.com",
      telefono: "555-0101",
    },
  });

  // Pacientes
  const paciente = await prisma.paciente.create({
    data: {
      nombre: "Carlos López",
      fecha_nacimiento: new Date("1990-05-14T00:00:00Z"),
      telefono: "555-0202",
      tipo_sangre: "O+",
      alergias: "Ninguna",
    },
  });

  // Citas
  await prisma.cita.create({
    data: {
      medico_id: medico.id_medico,
      paciente_id: paciente.id_paciente,
      fecha: new Date(),
      hora: new Date(),
      motivo: "Revisión mensual de rutina",
      estado: "Programada",
    },
  });

  console.log("✅ Base de datos sembrada (Seeded) exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
