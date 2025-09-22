import type { NextApiRequest, NextApiResponse } from "next";
function handler(req:NextApiRequest,res:NextApiResponse){
  const id = String((req.query.id as string)||"user@example.com");
  const name = String((req.query.name as string)||"User");
  res.setHeader("Set-Cookie", [
    `uid=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax`,
    `uname=${encodeURIComponent(name)}; Path=/; HttpOnly; SameSite=Lax`,
  ]);
  res.status(200).json({ ok:true, user:{ id, name } });
}
