import { RouteHandler } from "fastify";
import { createRefreshTokenForUser, handleGoogleCallback, mapUserToPayload } from "../services";
import { env } from "../../../config/env";
import { getSafeRedirectUrl } from "../config/auth.config";
import { GoogleOAuthError } from "../errors";

interface GoogleProfile {
    id: string;
    email: string;
    given_name?: string;
    family_name?: string;
}

const FRONTEND_URL = getSafeRedirectUrl(env.FRONTEND_URL);

export const googleCallbackHandler: RouteHandler = async (request, reply) => {
    try {
        const tokenResult = await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

        if (!tokenResult.token) throw new GoogleOAuthError('No se recibió token de Google OAuth2');

        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenResult.token.access_token}` }
        });

        if (!response.ok) {
            throw new GoogleOAuthError(`Error al obtener perfil de Google: HTTP ${response.status}`);
        }

        const profile = await response.json() as GoogleProfile;

        if (!profile || !profile.id || !profile.email) {
            throw new GoogleOAuthError('Respuesta de Google OAuth inválida: faltan campos requeridos (id, email)');
        }


        const user = await handleGoogleCallback(profile);
        const payload = mapUserToPayload(user);
        const accessTokenJWT = request.server.jwt.sign(payload);
        const refreshToken = await createRefreshTokenForUser(user.id);

        reply.setRefreshToken(refreshToken);
        // Non-httpOnly so the frontend can read it and store in localStorage
        reply.setTempAccessToken(accessTokenJWT);

        return reply.redirect(`${FRONTEND_URL}/auth/callback`);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error en autenticación con Google";
        return reply.redirect(`${FRONTEND_URL}/auth/callback?error=${encodeURIComponent(message)}`);
    }
};
