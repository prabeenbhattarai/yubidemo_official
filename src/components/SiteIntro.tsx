import LoaderMark from "./LoaderMark";

// Runs right after the intro is parsed, before the page is shown: on a repeat
// page load in the same visit it hides the intro straight away, so it only
// plays once per visit and never flashes.
const SKIP_IF_SEEN = `(function(){try{var el=document.getElementById("site-intro");if(!el)return;if(sessionStorage.getItem("yubi-intro")){el.style.display="none"}else{sessionStorage.setItem("yubi-intro","1")}}catch(e){}})()`;

/**
 * Brand intro on the first page load of a visit: the logo inside the loading
 * outline, with the jackhammer drilling, for about 3 seconds — then it fades
 * to the main page. Timing is pure CSS (.site-intro in globals.css), so it
 * finishes even if JavaScript is slow.
 */
export default function SiteIntro() {
  return (
    <>
      <div
        id="site-intro"
        aria-hidden
        suppressHydrationWarning
        className="site-intro fixed inset-0 z-[110] flex items-center justify-center bg-white"
      >
        <LoaderMark className="w-[170px] sm:w-[200px]" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: SKIP_IF_SEEN }} />
    </>
  );
}
