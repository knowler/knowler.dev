import { useParams } from "@remix-run/react";
import { useMemo } from "react";
import { useRouteData } from "remix-utils";
import type {LoaderData as MessageRouteData} from '../messages';

export default function Message() { const {messageId} = useParams();
  const {contactFormSubmissions} = useRouteData<MessageRouteData>('routes/admin/messages') as MessageRouteData;
  const message = useMemo(() => contactFormSubmissions.find(message => message.id === messageId), [messageId, contactFormSubmissions]);

  return (
    <article className="message">
      <h1>{message.subject}</h1>
      <div>
        From: <a href={`mailto:${message.email}`}>{message.name}</a>
      </div>
      <div>
        Sent: <time>{message?.createdAt}</time>
      </div>
      <div>
        {message?.message}
      </div>
    </article>
  );
}
