import Menu from "@/components/Menu";
import { PropsWithChildren } from "react";
import { Montserrat } from "next/font/google";

const inter = Montserrat({ subsets: ["latin"] });

function Layout({ children }: PropsWithChildren) {
  return (
    <body
      className={`${inter.className} flex flex-row`}
      style={{ background: "#1A1C26" }}
    >
      <Menu />
      <div>{children}</div>
    </body>
  );
}

export default Layout;
