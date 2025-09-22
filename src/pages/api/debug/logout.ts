import type { NextApiRequest, NextApiResponse } from "next";
function handler(req:NextApiRequest,res:NextApiResponse){
  res.setHeader("Set-Cookie", [
    `uid=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    `uname=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
  ]);
  res.status(200).json({ ok:true });
}
