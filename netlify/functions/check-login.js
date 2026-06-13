exports.handler = async (event) => {
  const { password } = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({
      valid: password === process.env.EDITOR_PASSWORD
    })
  };
};
