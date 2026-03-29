function validateRegisterPayload(payload) {
  const errors = [];

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    errors.push("email обязателен");
  }

  if (
    !payload.password ||
    typeof payload.password !== "string" ||
    payload.password.length < 6
  ) {
    errors.push("password должен содержать минимум 6 символов");
  }

  return errors;
}

function validateLoginPayload(payload) {
  const errors = [];

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    errors.push("email обязателен");
  }

  if (!payload.password || typeof payload.password !== "string" || !payload.password.trim()) {
    errors.push("password обязателен");
  }

  return errors;
}

function validateProductPayload(payload, { partial = false } = {}) {
  const errors = [];
  const has = (key) => payload[key] !== undefined;

  if (!partial || has("name")) {
    if (typeof payload.name !== "string" || !payload.name.trim()) {
      errors.push("name must be a non-empty string");
    }
  }

  if (!partial || has("category")) {
    if (typeof payload.category !== "string" || !payload.category.trim()) {
      errors.push("category must be a non-empty string");
    }
  }

  if (!partial || has("description")) {
    if (typeof payload.description !== "string" || !payload.description.trim()) {
      errors.push("description must be a non-empty string");
    }
  }

  if (!partial || has("price")) {
    if (typeof payload.price !== "number" || payload.price < 0) {
      errors.push("price must be a number >= 0");
    }
  }

  if (!partial || has("stock")) {
    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      errors.push("stock must be an integer >= 0");
    }
  }

  if (has("rating")) {
    if (
      payload.rating !== null &&
      (typeof payload.rating !== "number" || payload.rating < 0 || payload.rating > 5)
    ) {
      errors.push("rating must be null or number 0..5");
    }
  }

  if (has("image")) {
    if (payload.image !== null && typeof payload.image !== "string") {
      errors.push("image must be a string or null");
    }
  }

  return errors;
}

module.exports = {
  validateRegisterPayload,
  validateLoginPayload,
  validateProductPayload,
};