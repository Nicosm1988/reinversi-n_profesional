"use client";

import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
};

export function JourneyIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 640 560"
      className={cn("h-full w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="640" height="560" rx="44" fill="#FCF4EA" />
      <circle cx="430" cy="274" r="108" fill="#FFD7A9" />
      <circle cx="430" cy="274" r="68" fill="#FFF1DE" />
      <path d="M0 352C58 308 118 300 174 318C226 336 268 362 336 354C384 348 432 308 492 300C546 292 594 304 640 336V560H0V352Z" fill="#2F4C78" />
      <path d="M0 334C64 282 138 258 212 274C280 288 346 332 414 324C488 316 548 260 640 270V560H0V334Z" fill="#DCA37E" />
      <path d="M0 306C68 252 154 216 248 232C332 246 416 302 488 296C550 290 596 258 640 220V560H0V306Z" fill="#F7BC84" />
      <path d="M0 278C76 230 156 194 252 200C342 206 420 250 500 244C558 238 606 210 640 186V560H0V278Z" fill="#FFD2B3" />
      <path d="M48 184C84 150 126 150 174 188H48Z" fill="#B96E75" />
      <path d="M80 166C110 132 152 130 198 166H80Z" fill="#C98B8D" />
      <path d="M438 168C474 134 514 132 560 166H438Z" fill="#6E4864" />
      <path d="M488 146C518 120 558 118 606 146H488Z" fill="#58344F" />
      <path d="M244 500C226 414 246 344 312 302C386 254 458 262 520 324C570 374 584 432 574 500H244Z" fill="#F9EFE2" />
      <path d="M286 560C278 488 296 428 340 384C390 334 448 334 492 382C530 422 548 484 550 560H286Z" fill="#F8F0E8" />
      <path
        d="M70 560C108 468 170 420 224 392C266 370 300 352 320 322C330 306 336 286 338 260"
        stroke="#9CAF8C"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M514 560C504 480 492 426 474 392C454 352 424 328 390 306C368 292 352 276 346 256"
        stroke="#94A98C"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <circle cx="122" cy="478" r="14" fill="#C8898F" />
      <circle cx="560" cy="462" r="16" fill="#2F4C78" />
      <circle cx="548" cy="136" r="6" fill="#E9A16D" />
      <circle cx="124" cy="134" r="18" fill="#C98382" />
      <circle cx="92" cy="156" r="6" fill="#2F3647" />
      <circle cx="102" cy="538" r="8" fill="#F9C38D" />
      <circle cx="554" cy="494" r="4" fill="#D8B0A1" />
      <circle cx="86" cy="510" r="4" fill="#6E4864" />
      <path d="M266 452C266 426 278 404 302 392C324 380 350 380 372 392V520H266V452Z" fill="#A2B38A" />
      <rect x="302" y="392" width="70" height="126" rx="24" fill="#203A68" />
      <path d="M332 350C358 350 378 368 378 392V394H312V390C312 368 332 350 358 350Z" fill="#E18B63" />
      <path d="M306 452C306 430 316 412 338 404V492H306V452Z" fill="#A2B38A" />
      <path d="M372 452C372 430 390 412 414 412H418V492H372V452Z" fill="#A2B38A" />
      <rect x="332" y="514" width="24" height="46" rx="12" fill="#5E3C58" />
      <rect x="356" y="514" width="26" height="46" rx="12" fill="#5E3C58" />
      <path d="M372 428C388 428 402 440 404 456L408 492H372V428Z" fill="#8F6C7B" />
      <rect x="366" y="446" width="48" height="54" rx="18" fill="#B57B82" />
      <line x1="382" y1="446" x2="364" y2="420" stroke="#B57B82" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="150" cy="384" rx="18" ry="26" fill="#B37B81" />
      <ellipse cx="520" cy="390" rx="18" ry="28" fill="#9AAF8C" />
      <rect x="134" y="386" width="32" height="62" rx="16" fill="#8AA38A" />
      <rect x="504" y="394" width="32" height="70" rx="16" fill="#9AAF8C" />
      <defs />
    </svg>
  );
}

export function SupportIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 640 520"
      className={cn("h-full w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="640" height="520" rx="44" fill="#FCF6EF" />
      <ellipse cx="322" cy="398" rx="210" ry="54" fill="#F0E5DF" />
      <circle cx="262" cy="188" r="88" fill="#F2E5E2" />
      <circle cx="404" cy="184" r="76" fill="#EDE6E5" />
      <circle cx="178" cy="132" r="8" fill="#C98B8D" />
      <circle cx="480" cy="124" r="10" fill="#F1B08E" />
      <circle cx="132" cy="182" r="10" stroke="#5B4760" strokeWidth="3" />
      <circle cx="540" cy="188" r="8" stroke="#2F3647" strokeWidth="3" />
      <circle cx="114" cy="250" r="5" fill="#2F3647" />
      <circle cx="530" cy="242" r="5" fill="#C98B8D" />
      <rect x="276" y="132" width="58" height="28" rx="12" fill="#E9D9E2" />
      <path d="M350 140H386C395 140 402 147 402 156C402 165 395 172 386 172H372L360 182V172H350C341 172 334 165 334 156C334 147 341 140 350 140Z" fill="#F4B499" />
      <circle cx="196" cy="218" r="30" fill="#E9A37E" />
      <path d="M166 228C172 206 188 192 210 192C224 192 236 198 242 208C228 214 216 224 206 238L166 228Z" fill="#4B2343" />
      <path d="M134 340C138 286 166 252 218 252C258 252 286 274 294 330L134 340Z" fill="#4F2544" />
      <path d="M196 338C174 338 154 352 148 382H262C254 352 232 338 196 338Z" fill="#A8B695" />
      <circle cx="328" cy="214" r="32" fill="#E39B82" />
      <path d="M296 212C302 184 320 170 346 170C364 170 380 178 388 194C370 198 352 208 338 226L296 212Z" fill="#6A3B5E" />
      <path d="M260 364C274 294 304 252 354 252C408 252 440 294 442 368L260 364Z" fill="#B48589" />
      <path d="M324 320C286 320 250 344 232 392H410C396 342 370 320 324 320Z" fill="#E8A78D" />
      <circle cx="442" cy="226" r="28" fill="#D9A488" />
      <path d="M422 214C428 194 444 182 462 182C478 182 490 188 498 202C486 206 474 216 466 230L422 214Z" fill="#B57B82" />
      <path d="M404 376C406 308 434 266 480 266C520 266 542 302 548 376H404Z" fill="#1F3B67" />
      <path d="M450 334C430 334 418 352 414 386H528C520 348 496 334 450 334Z" fill="#2E5689" />
      <path d="M296 250C316 230 336 228 360 248" stroke="#6A3B5E" strokeWidth="8" strokeLinecap="round" />
      <path d="M448 252C464 234 482 232 498 246" stroke="#B57B82" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export function PuzzleIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 640 520"
      className={cn("h-full w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="640" height="520" rx="44" fill="#FBF5EC" />
      <ellipse cx="320" cy="430" rx="220" ry="34" fill="#E9DDD5" />
      <circle cx="122" cy="116" r="16" fill="#D7A2A5" />
      <circle cx="506" cy="106" r="14" fill="#B7C8A7" />
      <circle cx="544" cy="144" r="10" fill="#C9B5DB" />
      <circle cx="92" cy="248" r="8" fill="#A8C0E3" />
      <circle cx="550" cy="252" r="8" fill="#F2C48F" />
      <circle cx="474" cy="228" r="6" fill="#7D506C" />
      <path d="M220 354C236 292 274 254 326 254C384 254 418 292 430 354C376 344 272 344 220 354Z" fill="#5A3854" />
      <path d="M280 282C280 248 302 220 334 220C364 220 388 244 388 282V296H280V282Z" fill="#1F3B67" />
      <circle cx="336" cy="206" r="34" fill="#F2C6B0" />
      <path d="M304 208C308 176 330 158 358 158C382 158 402 176 404 202C392 196 378 194 364 194C344 194 324 200 304 208Z" fill="#233C67" />
      <path d="M208 392C220 358 250 338 286 338H380C416 338 446 358 458 392H208Z" fill="#2F3E72" />
      <path d="M274 338C250 348 228 372 220 406H308L274 338Z" fill="#5A3854" />
      <path d="M392 338C420 346 444 368 454 406H360L392 338Z" fill="#5A3854" />
      <path d="M278 392C260 392 244 408 244 426V430H326L278 392Z" fill="#5A3854" />
      <path d="M392 392C410 392 426 408 426 426V430H344L392 392Z" fill="#5A3854" />
      <path d="M286 274C302 292 322 302 348 304" stroke="#E8A78D" strokeWidth="8" strokeLinecap="round" />
      <path d="M214 120C252 94 286 84 322 88C358 92 388 112 424 92C458 74 490 78 530 116" stroke="#8BA18A" strokeWidth="4" strokeLinecap="round" />
      <path d="M220 154C252 126 292 118 328 124C360 130 396 154 430 138C462 122 496 126 522 150" stroke="#566481" strokeWidth="4" strokeLinecap="round" />
      <path d="M222 188C254 160 294 152 330 158C366 164 402 186 436 172C466 160 498 162 518 184" stroke="#7D506C" strokeWidth="4" strokeLinecap="round" />
      <path d="M258 104H288V120H304V150H288V166H258V150H242V120H258V104Z" fill="#C98895" />
      <path d="M394 98H426V114H442V144H426V160H394V144H378V114H394V98Z" fill="#B6C8A7" />
      <path d="M340 72H370V88H386V118H370V134H340V118H324V88H340V72Z" fill="#E7C36E" />
      <path d="M470 112H500V128H516V158H500V174H470V158H454V128H470V112Z" fill="#7D506C" />
    </svg>
  );
}

export function StairIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 640 520"
      className={cn("h-full w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="640" height="520" rx="44" fill="#FAF0EB" />
      <circle cx="100" cy="120" r="10" fill="#C99595" />
      <circle cx="520" cy="110" r="10" fill="#B6C7A6" />
      <circle cx="566" cy="160" r="8" fill="#7D506C" />
      <circle cx="116" cy="382" r="14" fill="#B6C7A6" />
      <path d="M180 452C216 410 244 374 266 340C294 294 316 238 330 168C338 126 340 88 344 54L438 42C434 88 426 140 410 196C390 268 360 330 318 390C286 436 248 472 204 506L180 452Z" fill="#4F2F4B" />
      <path d="M190 446C222 406 248 372 270 338C296 296 316 242 330 176C338 138 342 104 346 64" stroke="#71546B" strokeWidth="12" />
      <path d="M192 450L416 60" stroke="#2D2235" strokeWidth="86" strokeLinecap="round" />
      {Array.from({ length: 11 }).map((_, index) => (
        <path
          key={index}
          d={`M${190 + index * 20} ${446 - index * 35}L${246 + index * 20} ${414 - index * 35}`}
          stroke="#7E6379"
          strokeWidth="8"
          strokeLinecap="round"
        />
      ))}
      <path d="M418 78L430 56L450 58V84L418 78Z" fill="#2D2235" />
      <path d="M420 80L430 56V118" stroke="#98AF88" strokeWidth="5" strokeLinecap="round" />
      <path d="M312 252L322 226L340 230V252L312 252Z" fill="#2F4C78" />
      <path d="M316 252L322 226V292" stroke="#9AB28E" strokeWidth="5" strokeLinecap="round" />
      <path d="M220 410L228 388L246 390V412L220 410Z" fill="#C98D93" />
      <path d="M224 410L228 388V448" stroke="#9AB28E" strokeWidth="5" strokeLinecap="round" />
      <circle cx="296" cy="300" r="26" fill="#F2C6B0" />
      <path d="M274 302C276 280 292 264 314 264C330 264 344 272 352 286C340 286 326 290 316 300L274 302Z" fill="#B67B81" />
      <path d="M260 380C266 332 290 310 326 310C354 310 374 326 382 366L260 380Z" fill="#A8B893" />
      <path d="M306 350C284 350 266 366 258 388H352C346 366 330 350 306 350Z" fill="#2F4C78" />
      <rect x="270" y="376" width="24" height="54" rx="12" fill="#2F4C78" />
      <rect x="294" y="376" width="24" height="54" rx="12" fill="#2F4C78" />
      <circle cx="120" cy="230" r="8" fill="#2F4C78" />
      <circle cx="516" cy="224" r="8" fill="#2F4C78" />
      <path d="M116 198L120 206L128 208L122 214L124 224L116 220L108 224L110 214L104 208L112 206L116 198Z" fill="#7D506C" />
      <path d="M524 214L528 222L536 224L530 230L532 240L524 236L516 240L518 230L512 224L520 222L524 214Z" fill="#B6C7A6" />
    </svg>
  );
}

export function DoorsIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 640 520"
      className={cn("h-full w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="640" height="520" rx="44" fill="#FBF6ED" />
      <circle cx="120" cy="130" r="28" fill="#EFE6D9" />
      <circle cx="498" cy="112" r="34" fill="#C7D7EC" />
      <circle cx="562" cy="92" r="20" fill="#E2C16B" />
      <circle cx="196" cy="104" r="10" stroke="#E2C16B" strokeWidth="4" />
      <circle cx="420" cy="150" r="12" stroke="#DAC9BF" strokeWidth="4" />
      <circle cx="312" cy="96" r="8" stroke="#C7D7EC" strokeWidth="4" />
      <path d="M92 352C92 288 146 236 212 236C280 236 334 286 334 352V404H92V352Z" fill="#B8C7A8" />
      <path d="M124 352C124 304 160 268 212 268C264 268 302 304 302 352V404H124V352Z" fill="#D9A5A7" />
      <path d="M250 340C250 286 296 236 350 236C406 236 452 286 452 340V404H250V340Z" fill="#5E3654" />
      <path d="M384 352C384 292 434 244 492 244C550 244 600 292 600 352V404H384V352Z" fill="#29466F" />
      <path d="M488 352C488 300 526 260 576 260C612 260 640 288 640 326V404H488V352Z" fill="#F3B58F" />
      <path d="M132 352C132 310 166 278 212 278C258 278 292 310 292 352V404H132V352Z" fill="#BFD0B3" />
      <path d="M402 352C402 306 438 272 492 272C546 272 582 306 582 352V404H402V352Z" fill="#1F3B67" />
      <path d="M506 352C506 314 532 286 572 286C610 286 634 314 634 352V404H506V352Z" fill="#FAC7A2" />
      <path d="M142 350H282" stroke="#FBF6ED" strokeWidth="4" />
      <path d="M260 352H440" stroke="#FBF6ED" strokeWidth="4" />
      <path d="M412 352H572" stroke="#FBF6ED" strokeWidth="4" />
      <path d="M516 352H628" stroke="#FBF6ED" strokeWidth="4" />
      <path d="M168 322C168 294 188 274 214 274C240 274 258 294 258 322V332H168V322Z" fill="#F7EFE5" />
      <path d="M282 318C282 286 308 260 350 260C392 260 420 286 420 318V332H282V318Z" fill="#F7EFE5" />
      <path d="M430 324C430 290 456 266 492 266C530 266 556 290 556 324V338H430V324Z" fill="#F7EFE5" />
      <path d="M524 326C524 296 544 274 572 274C602 274 620 296 620 326V338H524V326Z" fill="#F7EFE5" />
      <line x1="212" y1="332" x2="212" y2="404" stroke="#F7EFE5" strokeWidth="4" />
      <line x1="350" y1="332" x2="350" y2="404" stroke="#F7EFE5" strokeWidth="4" />
      <line x1="492" y1="338" x2="492" y2="404" stroke="#F7EFE5" strokeWidth="4" />
      <line x1="572" y1="338" x2="572" y2="404" stroke="#F7EFE5" strokeWidth="4" />
      <circle cx="244" cy="366" r="5" fill="#E2C16B" />
      <circle cx="382" cy="366" r="5" fill="#E2C16B" />
      <circle cx="522" cy="368" r="5" fill="#E2C16B" />
      <circle cx="598" cy="368" r="5" fill="#E2C16B" />
      <circle cx="320" cy="434" r="20" fill="#3D4653" />
      <path d="M296 486C300 456 314 442 332 442C350 442 362 454 364 486H296Z" fill="#3D4653" />
      <rect x="308" y="482" width="18" height="34" rx="9" fill="#3D4653" />
      <rect x="326" y="482" width="18" height="34" rx="9" fill="#3D4653" />
      <path d="M336 448C346 452 356 460 360 470" stroke="#3D4653" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export function BridgeIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 640 520" className={cn("h-full w-full", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="520" rx="44" fill="#FCF5EC" />
      <circle cx="474" cy="130" r="62" fill="#FFD7A9" />
      <path d="M0 332C106 266 196 276 278 324C366 376 480 370 640 280V520H0V332Z" fill="#DCA37E" />
      <path d="M0 374C120 314 218 326 300 370C392 418 500 402 640 330V520H0V374Z" fill="#2F4C78" />
      <path d="M164 354C218 286 292 252 374 254C438 256 488 278 528 318" stroke="#F8F0E8" strokeWidth="34" strokeLinecap="round" />
      <path d="M166 354C220 288 294 258 374 260C438 262 484 282 524 318" stroke="#9CAF8C" strokeWidth="10" strokeLinecap="round" />
      <circle cx="310" cy="278" r="25" fill="#F2C6B0" />
      <path d="M280 350C284 306 304 286 336 286C370 286 390 312 392 356L280 350Z" fill="#5E3654" />
      <rect x="300" y="342" width="22" height="58" rx="11" fill="#2F3647" />
      <rect x="338" y="342" width="22" height="58" rx="11" fill="#2F3647" />
      <circle cx="104" cy="136" r="12" fill="#C98B8D" />
      <circle cx="146" cy="104" r="7" fill="#E2C16B" />
      <circle cx="548" cy="224" r="9" fill="#B7C8A7" />
    </svg>
  );
}

export function ClearingIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 640 520" className={cn("h-full w-full", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="520" rx="44" fill="#FBF6ED" />
      <ellipse cx="320" cy="420" rx="220" ry="42" fill="#E9DDD5" />
      <path d="M60 382C92 292 150 236 222 212C184 278 176 346 182 416L60 382Z" fill="#94A98C" />
      <path d="M580 382C548 292 490 236 418 212C456 278 464 346 458 416L580 382Z" fill="#A8B695" />
      <circle cx="320" cy="228" r="70" fill="#FFD7A9" />
      <path d="M264 406C272 340 292 296 320 270C350 298 372 340 380 406H264Z" fill="#E47C56" />
      <path d="M292 406C298 354 308 320 320 298C334 322 344 356 348 406H292Z" fill="#F8C28F" />
      <circle cx="178" cy="352" r="24" fill="#F2C6B0" />
      <path d="M136 420C142 380 158 360 188 360C216 360 234 380 240 420H136Z" fill="#2F4C78" />
      <circle cx="462" cy="352" r="24" fill="#E39B82" />
      <path d="M402 420C412 380 430 360 462 360C494 360 514 382 522 420H402Z" fill="#6E4864" />
      <circle cx="108" cy="126" r="8" fill="#C98B8D" />
      <circle cx="530" cy="136" r="10" fill="#E2C16B" />
    </svg>
  );
}

export function GrowthIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 640 520" className={cn("h-full w-full", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="520" rx="44" fill="#FAF0EB" />
      <circle cx="320" cy="170" r="88" fill="#FFF1DE" />
      <path d="M0 400C122 344 236 350 322 390C420 436 520 420 640 352V520H0V400Z" fill="#DCA37E" />
      <path d="M320 392C316 310 324 238 350 176" stroke="#5F7B65" strokeWidth="14" strokeLinecap="round" />
      <path d="M344 240C292 232 256 202 246 156C298 160 338 184 354 224" fill="#9CAF8C" />
      <path d="M340 290C394 278 434 244 450 198C396 198 354 224 334 270" fill="#B7C8A7" />
      <path d="M318 334C272 324 238 296 224 258C272 258 306 278 328 314" fill="#A2B38A" />
      <circle cx="132" cy="142" r="12" fill="#C98B8D" />
      <circle cx="510" cy="120" r="9" fill="#7D506C" />
      <circle cx="538" cy="174" r="6" fill="#E2C16B" />
      <path d="M270 420C282 380 302 360 332 360C362 360 384 382 392 420H270Z" fill="#2F3647" />
    </svg>
  );
}
