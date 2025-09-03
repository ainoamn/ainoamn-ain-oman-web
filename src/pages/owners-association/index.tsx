import { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/owners-association/home", permanent: false } });
export default function OwnersAssociationIndex(){ return null; }
