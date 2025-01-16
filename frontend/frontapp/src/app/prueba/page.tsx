import NotificacionesComponent from "./page.client";
import { getTokenFromCookies } from "../../utils/cookies";

export default async function pruebaNotificaciones() {
  const token = await getTokenFromCookies();
  return <NotificacionesComponent token={token} />;    
}