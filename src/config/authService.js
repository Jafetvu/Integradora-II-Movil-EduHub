import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL = "http://192.168.100.200:8080/eduhub";  // Para dispositivo Android físico


export const checkTokenExpiration = async () => {
  const token = await AsyncStorage.getItem("authToken");

  if (token) {
    try {
      const payloadBase64 = token.split('.')[1]; // Obtener el payload del JWT
      const decodedPayload = JSON.parse(atob(payloadBase64)); // Decodificar manualmente
      const currentTime = Date.now() / 1000;

      if (decodedPayload.exp < currentTime) {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userId");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      console.log("Desde metodo");
      return false;
    }
  }

  return false;
};

export const login = async (user, password) => {
  try {
    const response = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });

    console.log("Estado HTTP:", response.status);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.body || "Error en el login" };
    }

    // Verifica si el token, datos del usuario y el rol están presentes
    if (data.body.token && data.body.user && data.body.user.role) {
      // Validar que el rol sea ROLE_STUDENT
      if (data.body.user.role !== "ROLE_STUDENT") {
        return { 
          success: false, 
          message: "Solo los estudiantes pueden acceder a esta aplicación",
          invalidRole: true // Bandera para identificar este error específico
        };
      }

      await AsyncStorage.setItem("authToken", data.body.token);
      await AsyncStorage.setItem("userId", data.body.user.id);
      console.log("Token y ID del usuario guardados:", data.body.token, data.body.user.id);
      return { success: true, token: data.body.token, user: data.body.user };
    } else {
      return { success: false, message: "Datos incompletos en la respuesta del servidor" };
    }
  } catch (error) {
    console.error("Error en el login:", error);
    return { success: false, message: "Error de conexión" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    console.log("Código de estado:", response.status);
    const text = await response.text();
    const message = text || "Se ha enviado el correo de recuperación.";

    // Consideramos éxito si el código es 200, 201 o 204
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return { success: true, message };
    } else {
      return { success: false, message };
    }
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return { success: false, message: "Error de conexión" };
  }
};





export const logout = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userId");
    console.log("Token eliminado");
  } catch (error) {
    console.error("Error al eliminar el token:", error);
  }
};

export const register = async (user) => {
  try {
    const response = await fetch(`${API_URL}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    console.log("Estado HTTP:", response.status); // Verifica el estado de la respuesta

    // Solo devolver el estado HTTP
    return { status: response.status };
  } catch (error) {
    // Si hay un error en la conexión o cualquier otro error, lo capturamos
    console.error("Error de conexión:", error);
    throw new Error("No se pudo conectar con el servidor");
  }
};



export const checkEmail = async (email) => {
  try {
    console.log("Iniciando verificación de correo electrónico...");
    const response = await fetch(`${API_URL}/auth/check-email?email=${email}`);
    console.log("Respuesta del servidor:", response.status, response.statusText);

    const data = await response.text();
    console.log("Respuesta del servidor (texto):", data);

    return {
      status: response.status,
      message: data,
    };
  } catch (error) {
    console.error("Error en checkEmail:", error);
    throw error; // Solo lanzamos errores de conexión o problemas graves
  }
};


export const getUserById = async (id) => {
  try {
    const token = await AsyncStorage.getItem("authToken"); // Obtén el token de AsyncStorage

    const response = await fetch(`${API_URL}/api/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Envía el token en el header
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`); // Manejo de errores
    }

    const data = await response.json(); // Convertir la respuesta a JSON
    //console.log('Datos recibidos:', data);
    return data; // Retornar los datos
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    throw error; // Lanzar el error para manejarlo en otro lugar si es necesario
  }
};


export const updateUser = async (userId, updatedData) => {
  try {
    // Obtener el token de autenticación desde AsyncStorage
    const token = await AsyncStorage.getItem("authToken");

    // Hacer la solicitud PUT al backend
    const response = await fetch(`${API_URL}/api/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Enviar el token en el header
      },
      body: JSON.stringify({
        id: userId, // Enviar el ID del usuario
        ...updatedData, // Enviar los datos actualizados
      }),
    });

    console.log("Respuesta del servidor:", response); // Verificar la respuesta completa

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      let errorMessage = "Error al actualizar el usuario";

      // Verificar si el error es 403 (Forbidden)
      if (response.status === 403) {
        errorMessage = "No tienes permisos para realizar esta acción.";
      } else {
        // Intentar obtener el mensaje de error del cuerpo de la respuesta
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no es JSON, usar el texto como mensaje de error
          errorMessage = responseText;
        }
      }

      throw new Error(errorMessage);
    }

    // Si la respuesta es exitosa, no necesitamos parsear el cuerpo
    console.log("Usuario actualizado correctamente");
    return; // No es necesario retornar datos
  } catch (error) {
    console.error("Error en updateUser:", error);
    throw error; // Lanzar el error para manejarlo en otro lugar si es necesario
  }
};

export const verifyPassword = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: email, password }),
    });

    console.log("Estado HTTP:", response.status); // Verifica el estado de la respuesta

    if (!response.ok) {
      // Si el estado no es 200-299, devolver un objeto con el error
      const errorText = await response.text(); // Obtener el cuerpo de la respuesta como texto
      return { success: false, status: response.status, message: errorText };
    }

    // Si la respuesta es exitosa, devolver el código de estado
    return { success: true, status: response.status };
  } catch (error) {
    console.error("Error en verifyPassword:", error);
    // Si hay un error de conexión o algo inesperado, devolver un objeto con el error
    return { success: false, status: 500, message: "Error de conexión" };
  }
};



export const getCourses = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    const response = await fetch(`${API_URL}/api/courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Acceso denegado. Verifica tus permisos o renueva el token.");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    //console.log("Datos recibidos:", data);

    // Función para formatear la fecha a DD/MM/YY
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
      const year = String(date.getFullYear()).slice(-2); // Obtiene los últimos dos dígitos del año
      return `${day}/${month}/${year}`;
    };

    // Mapea los datos para que coincidan con las propiedades que espera CourseItem
    const mappedData = data.map((course) => ({
      id: course.id,
      titulo: course.title,
      precio: course.price,
      descripcion: course.description,
      categoria: course.category,
      fechaInicio: formatDate(course.dateStart), // Formatea la fecha
      fechaFin: formatDate(course.dateEnd),
      coverImage: course.coverImage,
      docenteId: course.docenteId,
      status: course.status,
      certificate : course.hasCertificate
    }));

    return mappedData;
  } catch (error) {
    console.error("Error en getCourses:", error);
    throw error;
  }
};

export const getCourseByStudent = async (studentId) => {
  try {
    // Obtener el token de autenticación desde AsyncStorage
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    // Realizar la petición GET al endpoint
    const response = await fetch(`${API_URL}/api/courses/student/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Enviar el token en el header
      },
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Acceso denegado. Verifica tus permisos o renueva el token.");
      } else if (response.status === 404) {
        // Si no hay cursos inscritos, devolver un array vacío
        return [];
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    // Convertir la respuesta a JSON
    const data = await response.json();
    //console.log("Cursos del estudiante:", data);

    // Función para formatear la fecha a DD/MM/YY
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
      const year = String(date.getFullYear()).slice(-2); // Obtiene los últimos dos dígitos del año
      return `${day}/${month}/${year}`;
    };

    // Mapear los datos para que coincidan con las propiedades que espera tu aplicación
    const mappedData = data.map((course) => ({
      id: course.id,
      titulo: course.title,
      precio: course.price,
      descripcion: course.description,
      categoria: course.category,
      fechaInicio: formatDate(course.dateStart), // Formatea la fecha
      fechaFin: formatDate(course.dateEnd),
      coverImage: course.coverImage,
      docenteId: course.docenteId,
      enrollments: course.enrollments,
      sessions: course.sessions,
      status: course.status,


    }));

    return mappedData;
  } catch (error) {
    console.error("Error en getCourseByStudent:", error);
    throw error;
  }
};
export const requestEnrollment = async (courseId, studentId, voucher) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    // Configurar FormData solo si hay voucher
    let body;
    let headers = {
      Authorization: `Bearer ${token}`,
    };

    if (voucher) {
      const formData = new FormData();
      formData.append("voucher", {
        uri: voucher.uri,
        name: voucher.name || "voucher",
        type: voucher.type || "image/jpeg",
      });

      body = formData;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({}); // Cuerpo vacío para cursos gratuitos
    }

    const response = await fetch(
      `${API_URL}/api/courses/${courseId}/enroll/${studentId}`,
      {
        method: "POST",
        headers,
        body,
      }
    );

    // Manejar respuesta
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: responseData.message || "Error en la solicitud",
      };
    }

    return {
      success: true,
      status: response.status,
      message: responseData.message || "Solicitud procesada correctamente",
    };
  } catch (error) {
    console.error("Error en requestEnrollment:", error);
    return {
      success: false,
      status: 500,
      message: error.message || "Error de conexión",
    };
  }
};

// Para cursos de pago (con voucher)
export const requestPaidEnrollment = async (courseId, studentId, voucher) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No se encontró el token de autenticación");
    if (!voucher) throw new Error("Se requiere un comprobante de pago");

    const formData = new FormData();
    formData.append("voucher", {
      uri: voucher.uri,
      name: voucher.name || `voucher_${Date.now()}`,
      type: voucher.type || "image/jpeg",
    });

    const response = await fetch(
      `${API_URL}/api/courses/${courseId}/enroll/${studentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("Error en requestPaidEnrollment:", error);
    return {
      success: false,
      status: 500,
      message: error.message || "Error al procesar el pago",
    };
  }
};

// Para cursos gratuitos (sin voucher)
// Para cursos gratuitos (sin voucher)
// Para cursos gratuitos (sin voucher)
export const requestFreeEnrollment = async (courseId, studentId) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No se encontró el token de autenticación");

    // Usar FormData con campo dummy para evitar errores en Android
    const formData = new FormData();
    formData.append("freeEnrollment", "true"); // Campo necesario para estructura multipart

    const response = await fetch(
      `${API_URL}/api/courses/${courseId}/enroll/${studentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const responseText = await response.text();
    let message = responseText;

    try {
      message = JSON.parse(responseText).message || message;
    } catch (e) {
      if (response.ok) {
        message = "Inscripción completada exitosamente";
      }
    }

    return {
      success: response.ok,
      status: response.status,
      message: response.ok
        ? message 
        : message || "Error en la inscripción gratuita",
    };
  } catch (error) {
    console.error("Error en requestFreeEnrollment:", error);
    return {
      success: false,
      status: 500,
      message: this.handleNetworkError(error),
    };
  }
};

// Manejador de errores de red
const handleNetworkError = (error) => {
  if (error.message.includes("Network request failed")) {
    return "Error de conexión. Verifica tu acceso a internet";
  }
  return error.message || "Error desconocido";
};

// Función auxiliar para manejar respuestas
const handleResponse = async (response) => {
  const responseText = await response.text();
  let message = responseText;

  try {
    const data = JSON.parse(responseText);
    message = data.message || message;
  } catch (e) {
    /* No es JSON */
  }

  return {
    success: response.ok,
    status: response.status,
    message: response.ok
      ? message || "Operación realizada con éxito"
      : message || "Error en la solicitud",
  };
};

export const completeSession = async (courseId, studentId, sessionId) => {
  try {
    // Verificar token y expiración
    const isTokenValid = await checkTokenExpiration();
    if (!isTokenValid) {
      await logout();
      return { 
        success: false, 
        message: "Sesión expirada. Por favor inicia sesión nuevamente.",
        unauthorized: true 
      };
    }

    const token = await AsyncStorage.getItem("authToken");
    
    const response = await fetch(
      `${API_URL}/api/courses/${courseId}/complete-session/${studentId}/${sessionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Manejar diferentes códigos de estado
    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = "Error desconocido";
      switch (response.status) {
        case 401:
          errorMessage = "Acceso no autorizado al curso";
          break;
        case 404:
          errorMessage = "Curso no encontrado";
          break;
        default:
          errorMessage = responseText || "Error al completar la sesión";
      }
      return { success: false, status: response.status, message: errorMessage };
    }

    // Si la respuesta es exitosa
    return { 
      success: true, 
      status: response.status,
      message: responseText,
      progress: extractProgressFromMessage(responseText) // Opcional: función helper
    };

  } catch (error) {
    console.error("Error en completeSession:", error);
    return { 
      success: false, 
      message: "Error de conexión", 
      status: 500 
    };
  }
};

// Función opcional para extraer el progreso del mensaje
const extractProgressFromMessage = (message) => {
  const match = message.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : null;
};


export const rateCourse = async (courseId, ratingValue, comment, userId) => {
  try {
    // Verificar expiración del token
    const isTokenValid = await checkTokenExpiration();
    if (!isTokenValid) {
      await logout();
      return { 
        success: false, 
        message: "Sesión expirada. Por favor inicia sesión nuevamente.",
        unauthorized: true
      };
    }

    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      return { success: false, message: "No se encontró el token de autenticación" };
    }

    const response = await fetch(`${API_URL}/api/courses/${courseId}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: ratingValue,
        comment: comment,
        userId: userId,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      // Manejar diferentes códigos de estado específicos
      let errorMessage = responseText;
      switch (response.status) {
        case 400:
          errorMessage = "Ya has calificado este curso o datos inválidos";
          break;
        case 401:
          errorMessage = "Debes estar inscrito en el curso para calificar";
          break;
        case 404:
          errorMessage = "Curso no encontrado";
          break;
      }
      return { 
        success: false, 
        status: response.status,
        message: errorMessage 
      };
    }

    return { 
      success: true,
      status: response.status,
      message: "Calificación agregada correctamente" 
    };

  } catch (error) {
    console.error("Error en rateCourse:", error);
    return { 
      success: false, 
      message: "Error de conexión",
      status: 500 
    };
  }
};

export const getUserNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const response = await fetch(`${API_URL}/api/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    throw error;
  }
};