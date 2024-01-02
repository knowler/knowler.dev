import { nanoid } from "nanoid";
import { getCookie, setCookie } from "hono/middleware";
import { CookieStore, Session, encrypt, decrypt } from "hono_sessions";

export function sessionMiddleware(options) {

  const store = options.store
  const encryptionKey = options.encryptionKey
  const expireAfterSeconds = options.expireAfterSeconds
  const cookieOptions = options.cookieOptions
  const sessionCookieName = options.sessionCookieName || "session"

  if (store instanceof CookieStore) {
    store.sessionCookieName = sessionCookieName
  
    if (encryptionKey) {
      store.encryptionKey = encryptionKey
    } else {
      throw new Error('encryptionKey is required while using CookieStore. encryptionKey must be at least 32 characters long.')
    }
  
    if (cookieOptions) {
      store.cookieOptions = cookieOptions
    }
  }

  const middleware = async (c, next) => {
    const session = new Session();
    let sid = '';
    let session_data;
    let createNewSession = false;

    const sessionCookie = getCookie(c, sessionCookieName)
  
    if (sessionCookie) { // If there is a session cookie present...

      if (store instanceof CookieStore) {
        session_data = await store.getSession(c)
      } else {
        try {
          sid = (encryptionKey ? await decrypt(encryptionKey, sessionCookie) : sessionCookie)
          session_data = await store.getSessionById(sid)
        } catch {
          createNewSession = true
        }
      }

      if (session_data) {
        session.setCache(session_data)

        if (session.sessionValid()) {
          session.reupSession(expireAfterSeconds)
        } else {
          store instanceof CookieStore ? await store.deleteSession(c) : await store.deleteSession(sid)
          createNewSession = true
        }
      } else {
        createNewSession = true
      }
    } else {
      createNewSession = true
    }

    if (createNewSession) {
      const defaultData = {
        _data:{},
        _expire: null,
        _delete: false,
        _accessed: null,
      }

      if (store instanceof CookieStore) {
        await store.createSession(c, defaultData)
      } else {
        sid = await nanoid(21)
        await store.createSession(sid, defaultData)
      }

      session.setCache(defaultData)
    }
  
    if (!(store instanceof CookieStore)) {
      setCookie(c, sessionCookieName, encryptionKey ? await encrypt(encryptionKey, sid) : sid, cookieOptions)
    }

    session.updateAccess()

    c.set(sessionCookieName, session)

    await next()

    if (c.get('session_key_rotation') === true && !(store instanceof CookieStore)) {
      await store.deleteSession(sid)
      sid = await nanoid(21)
      await store.createSession(sid, session.getCache())

      setCookie(c, sessionCookieName, encryptionKey ? await encrypt(encryptionKey, sid) : sid, cookieOptions)
    }

    store instanceof CookieStore ? await store.persistSessionData(c, session.getCache()) : await store.persistSessionData(sid, session.getCache())

    if (session.getCache()._delete) {
      store instanceof CookieStore ? await store.deleteSession(c) : await store.deleteSession(sid)
    }
  }

  return middleware
}
