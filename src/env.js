const development_host = 'localhost:4567';
const production_host = process.env.REACT_APP_API_HOST;
const host = process.env.NODE_ENV === "production" ? production_host : development_host;

export const API_HOST = `http://${host}`;
