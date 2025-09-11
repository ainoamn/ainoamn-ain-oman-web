// src/pages/auth/verify.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";

function getUserIdClient(): string|null { try { return localStorage.getItem("ao_user_id"); } catch { return null; } }

export default function VerifyPage(){
  const router = useRouter
