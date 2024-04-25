import {
  getJWTHeaderFromLocalStorage,
  privateAxiosInstance,
} from './axios.service';

export async function followArtist(artistIdx: number, follow: boolean) {
  const res = await privateAxiosInstance.post(
    '/artist/follow',
    {artistIdx, follow},
    {headers: await getJWTHeaderFromLocalStorage()},
  );
  console.log('[res stauts]', res.status);
}

export async function followConcert(concertIdx: number, follow: boolean) {
  const res = await privateAxiosInstance.post(
    '/concert/save',
    {concertIdx, follow},
    {headers: await getJWTHeaderFromLocalStorage()},
  );
  console.log('[res status]', res.status);
}
