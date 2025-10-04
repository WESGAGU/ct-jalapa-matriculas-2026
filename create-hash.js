const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'wes123'; // La contraseña que quieres hashear
  const saltRounds = 10; // El "costo" del hasheo

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Tu contraseña en texto plano es:', password);
    console.log('Copia este hash en tu base de datos:');
    console.log(hashedPassword);
  } catch (error) {
    console.error('Error al hashear la contraseña:', error);
  }
}

hashPassword();