import queryString from 'query-string';
import { API_HOST } from './env';

export const fetchFromAPI = async (path, params, mappingFn) => {
  const endpoint  = `${API_HOST}${path}?${queryString.stringify(params)}`;

  try {
    const response  = await fetch(endpoint);
    const json      = await response.json()

    return mappingFn !== undefined ? mappingFn(json) : json
  }
  catch(e) {
    return null;
  }
}
