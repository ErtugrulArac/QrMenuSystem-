/**
 * Herkese açık routelar
 * Bunlar login gerektirmez
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/category",
  "/cart",
  "/table-selection",
  "/auth/login"
];
 
  


  /**
   * Bu sayfalara erişim sağlamaya çalışan giriş yapmış 
   * Kullanıcılar /settings sayfasına yönlendirilir
   * @type {string[]}
   */
  export const authRoutes = [
    "/auth/login"
  ];
  
  /**
   * Bu routelar api tarafından kullanılır
   * Erişim engeli konulmamalı
   * @type {string}
   */
  export const apiAuthPrefix = "/api/auth";
  
  /**
   * Oturum açtıktan sonra varsayılan yönlendirme yolu
   * @type {string}
   */
  export const DEFAULT_LOGIN_REDIRECT = "/dashboard";


