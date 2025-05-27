/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/weather/route";
exports.ids = ["app/api/weather/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/github */ \"(rsc)/./node_modules/next-auth/providers/github.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n\n// For debugging purposes\nconsole.log(\"NextAuth Config:\", {\n    googleId: process.env.GOOGLE_CLIENT_ID ? \"Set\" : \"Not set\",\n    googleSecret: process.env.GOOGLE_CLIENT_SECRET ? \"Set\" : \"Not set\",\n    nextAuthUrl: process.env.NEXTAUTH_URL,\n    nextAuthSecret: process.env.NEXTAUTH_SECRET ? \"Set\" : \"Not set\"\n});\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"]),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID || \"\",\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET || \"\",\n            authorization: {\n                params: {\n                    scope: \"openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read\",\n                    prompt: \"consent\",\n                    access_type: \"offline\",\n                    response_type: \"code\"\n                }\n            },\n            allowDangerousEmailAccountLinking: true\n        }),\n        (0,next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.GITHUB_ID || \"\",\n            clientSecret: process.env.GITHUB_SECRET || \"\",\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            console.log(\"SignIn callback:\", {\n                user: user ? {\n                    id: user.id,\n                    name: user.name,\n                    email: user.email\n                } : null,\n                account: account ? {\n                    provider: account.provider,\n                    type: account.type\n                } : null,\n                profile: profile ? {\n                    email: profile.email\n                } : null\n            });\n            // Allow sign in regardless of whether the account is already linked\n            return true;\n        },\n        async jwt ({ token, user, account, trigger, session }) {\n            // Initial sign in\n            if (account && user) {\n                console.log(\"JWT callback (initial sign in):\", {\n                    provider: account.provider,\n                    accessToken: account.access_token ? \"Provided\" : \"Missing\",\n                    refreshToken: account.refresh_token ? \"Provided\" : \"Missing\",\n                    expiresAt: account.expires_at\n                });\n                return {\n                    ...token,\n                    accessToken: account.access_token,\n                    refreshToken: account.refresh_token,\n                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,\n                    userRole: \"user\",\n                    userId: user.id\n                };\n            }\n            // Handle updates\n            if (trigger === 'update' && session) {\n                return {\n                    ...token,\n                    ...session\n                };\n            }\n            // Return previous token if the access token has not expired yet\n            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {\n                console.log(\"JWT callback: Using existing token (not expired)\");\n                return token;\n            }\n            console.log(\"JWT callback: Token may be expired or missing expires time\");\n            return token;\n        },\n        async session ({ session, token }) {\n            // This is now always called with a token, not a user\n            if (token) {\n                console.log(\"Session callback with token:\", {\n                    userId: token.userId,\n                    accessToken: token.accessToken ? \"Provided\" : \"Missing\"\n                });\n                // Add the access token and user ID to the session\n                session.accessToken = token.accessToken;\n                session.user.id = token.userId || token.sub;\n                // Fetch user role from database\n                if (session.user.id) {\n                    const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"].user.findUnique({\n                        where: {\n                            id: session.user.id\n                        },\n                        select: {\n                            role: true\n                        }\n                    });\n                    session.user.role = user?.role || 'USER';\n                }\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    debug: \"development\" === \"development\",\n    secret: process.env.NEXTAUTH_SECRET,\n    session: {\n        strategy: \"jwt\",\n        maxAge: 24 * 60 * 60\n    },\n    logger: {\n        error (code, metadata) {\n            console.error(`NextAuth Error: ${code}`, metadata);\n        },\n        warn (code) {\n            console.warn(`NextAuth Warning: ${code}`);\n        },\n        debug (code, metadata) {\n            console.log(`NextAuth Debug: ${code}`, metadata);\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBaUM7QUFDb0I7QUFDRztBQUNBO0FBQ3RCO0FBRWxDLHlCQUF5QjtBQUN6QkssUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtJQUM5QkMsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0IsR0FBRyxRQUFRO0lBQ2pEQyxjQUFjSCxRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixHQUFHLFFBQVE7SUFDekRDLGFBQWFMLFFBQVFDLEdBQUcsQ0FBQ0ssWUFBWTtJQUNyQ0MsZ0JBQWdCUCxRQUFRQyxHQUFHLENBQUNPLGVBQWUsR0FBRyxRQUFRO0FBQ3hEO0FBRU8sTUFBTUMsY0FBYztJQUN6QkMsU0FBU2pCLG1FQUFhQSxDQUFDRyxtREFBTUE7SUFDN0JlLFdBQVc7UUFDVGhCLHNFQUFjQSxDQUFDO1lBQ2JpQixVQUFVWixRQUFRQyxHQUFHLENBQUNDLGdCQUFnQixJQUFJO1lBQzFDVyxjQUFjYixRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixJQUFJO1lBQ2xEVSxlQUFlO2dCQUNiQyxRQUFRO29CQUNOQyxPQUFPO29CQUNQQyxRQUFRO29CQUNSQyxhQUFhO29CQUNiQyxlQUFlO2dCQUNqQjtZQUNGO1lBQ0FDLG1DQUFtQztRQUNyQztRQUNBMUIsc0VBQWNBLENBQUM7WUFDYmtCLFVBQVVaLFFBQVFDLEdBQUcsQ0FBQ29CLFNBQVMsSUFBSTtZQUNuQ1IsY0FBY2IsUUFBUUMsR0FBRyxDQUFDcUIsYUFBYSxJQUFJO1lBQzNDRixtQ0FBbUM7UUFDckM7S0FDRDtJQUNERyxXQUFXO1FBQ1QsTUFBTUMsUUFBTyxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFO1lBQ3JDOUIsUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtnQkFDOUIyQixNQUFNQSxPQUFPO29CQUFFRyxJQUFJSCxLQUFLRyxFQUFFO29CQUFFQyxNQUFNSixLQUFLSSxJQUFJO29CQUFFQyxPQUFPTCxLQUFLSyxLQUFLO2dCQUFDLElBQUk7Z0JBQ25FSixTQUFTQSxVQUFVO29CQUFFSyxVQUFVTCxRQUFRSyxRQUFRO29CQUFFQyxNQUFNTixRQUFRTSxJQUFJO2dCQUFDLElBQUk7Z0JBQ3hFTCxTQUFTQSxVQUFVO29CQUFFRyxPQUFPSCxRQUFRRyxLQUFLO2dCQUFDLElBQUk7WUFDaEQ7WUFFQSxvRUFBb0U7WUFDcEUsT0FBTztRQUNUO1FBQ0EsTUFBTUcsS0FBSSxFQUFFQyxLQUFLLEVBQUVULElBQUksRUFBRUMsT0FBTyxFQUFFUyxPQUFPLEVBQUVDLE9BQU8sRUFBRTtZQUNsRCxrQkFBa0I7WUFDbEIsSUFBSVYsV0FBV0QsTUFBTTtnQkFDbkI1QixRQUFRQyxHQUFHLENBQUMsbUNBQW1DO29CQUM3Q2lDLFVBQVVMLFFBQVFLLFFBQVE7b0JBQzFCTSxhQUFhWCxRQUFRWSxZQUFZLEdBQUcsYUFBYTtvQkFDakRDLGNBQWNiLFFBQVFjLGFBQWEsR0FBRyxhQUFhO29CQUNuREMsV0FBV2YsUUFBUWdCLFVBQVU7Z0JBQy9CO2dCQUdBLE9BQU87b0JBQ0wsR0FBR1IsS0FBSztvQkFDUkcsYUFBYVgsUUFBUVksWUFBWTtvQkFDakNDLGNBQWNiLFFBQVFjLGFBQWE7b0JBQ25DRyxvQkFBb0JqQixRQUFRZ0IsVUFBVSxHQUFHaEIsUUFBUWdCLFVBQVUsR0FBRyxPQUFPRTtvQkFDckVDLFVBQVU7b0JBQ1ZDLFFBQVFyQixLQUFLRyxFQUFFO2dCQUNqQjtZQUNGO1lBRUEsaUJBQWlCO1lBQ2pCLElBQUlPLFlBQVksWUFBWUMsU0FBUztnQkFDbkMsT0FBTztvQkFBRSxHQUFHRixLQUFLO29CQUFFLEdBQUdFLE9BQU87Z0JBQUM7WUFDaEM7WUFFQSxnRUFBZ0U7WUFDaEUsSUFBSUYsTUFBTVMsa0JBQWtCLElBQUlJLEtBQUtDLEdBQUcsS0FBS2QsTUFBTVMsa0JBQWtCLEVBQUU7Z0JBQ3JFOUMsUUFBUUMsR0FBRyxDQUFDO2dCQUNaLE9BQU9vQztZQUNUO1lBRUFyQyxRQUFRQyxHQUFHLENBQUM7WUFDWixPQUFPb0M7UUFDVDtRQUNBLE1BQU1FLFNBQVEsRUFBRUEsT0FBTyxFQUFFRixLQUFLLEVBQUU7WUFDOUIscURBQXFEO1lBQ3JELElBQUlBLE9BQU87Z0JBQ1RyQyxRQUFRQyxHQUFHLENBQUMsZ0NBQWdDO29CQUMxQ2dELFFBQVFaLE1BQU1ZLE1BQU07b0JBQ3BCVCxhQUFhSCxNQUFNRyxXQUFXLEdBQUcsYUFBYTtnQkFDaEQ7Z0JBRUEsa0RBQWtEO2dCQUNsREQsUUFBUUMsV0FBVyxHQUFHSCxNQUFNRyxXQUFXO2dCQUN2Q0QsUUFBUVgsSUFBSSxDQUFDRyxFQUFFLEdBQUdNLE1BQU1ZLE1BQU0sSUFBSVosTUFBTWUsR0FBRztnQkFFM0MsZ0NBQWdDO2dCQUNoQyxJQUFJYixRQUFRWCxJQUFJLENBQUNHLEVBQUUsRUFBRTtvQkFDbkIsTUFBTUgsT0FBTyxNQUFNN0IsbURBQU1BLENBQUM2QixJQUFJLENBQUN5QixVQUFVLENBQUM7d0JBQ3hDQyxPQUFPOzRCQUFFdkIsSUFBSVEsUUFBUVgsSUFBSSxDQUFDRyxFQUFFO3dCQUFDO3dCQUM3QndCLFFBQVE7NEJBQUVDLE1BQU07d0JBQUs7b0JBQ3ZCO29CQUNBakIsUUFBUVgsSUFBSSxDQUFDNEIsSUFBSSxHQUFHNUIsTUFBTTRCLFFBQVE7Z0JBQ3BDO1lBQ0Y7WUFFQSxPQUFPakI7UUFDVDtJQUNGO0lBQ0FrQixPQUFPO1FBQ0w5QixRQUFRO1FBQ1IrQixPQUFPO0lBQ1Q7SUFDQUMsT0FBT3hELGtCQUF5QjtJQUNoQ3lELFFBQVF6RCxRQUFRQyxHQUFHLENBQUNPLGVBQWU7SUFDbkM0QixTQUFTO1FBQ1BzQixVQUFVO1FBQ1ZDLFFBQVEsS0FBSyxLQUFLO0lBQ3BCO0lBQ0FDLFFBQVE7UUFDTkwsT0FBTU0sSUFBSSxFQUFFQyxRQUFRO1lBQ2xCakUsUUFBUTBELEtBQUssQ0FBQyxDQUFDLGdCQUFnQixFQUFFTSxNQUFNLEVBQUVDO1FBQzNDO1FBQ0FDLE1BQUtGLElBQUk7WUFDUGhFLFFBQVFrRSxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsRUFBRUYsTUFBTTtRQUMxQztRQUNBTCxPQUFNSyxJQUFJLEVBQUVDLFFBQVE7WUFDbEJqRSxRQUFRQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRStELE1BQU0sRUFBRUM7UUFDekM7SUFDRjtBQUNGLEVBQUU7QUFFRixNQUFNRSxVQUFVeEUsZ0RBQVFBLENBQUNpQjtBQUVrQiIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSBcIkBhdXRoL3ByaXNtYS1hZGFwdGVyXCI7XG5pbXBvcnQgR2l0aHViUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ2l0aHViXCI7XG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcblxuLy8gRm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xuY29uc29sZS5sb2coXCJOZXh0QXV0aCBDb25maWc6XCIsIHtcbiAgZ29vZ2xlSWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIGdvb2dsZVNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIG5leHRBdXRoVXJsOiBwcm9jZXNzLmVudi5ORVhUQVVUSF9VUkwsXG4gIG5leHRBdXRoU2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG59KTtcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zID0ge1xuICBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIEdvb2dsZVByb3ZpZGVyKHtcbiAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIHx8IFwiXCIsXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhdXRob3JpemF0aW9uOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHNjb3BlOiBcIm9wZW5pZCBlbWFpbCBwcm9maWxlIGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvY2FsZW5kYXIgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9jYWxlbmRhci5ldmVudHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5yZWFkb25seSBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLm1ldGFkYXRhLnJlYWRvbmx5IGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHkgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5sYWJlbHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmFjdGl2aXR5LnJlYWQgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmJvZHkucmVhZFwiLFxuICAgICAgICAgIHByb21wdDogXCJjb25zZW50XCIsXG4gICAgICAgICAgYWNjZXNzX3R5cGU6IFwib2ZmbGluZVwiLFxuICAgICAgICAgIHJlc3BvbnNlX3R5cGU6IFwiY29kZVwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gICAgR2l0aHViUHJvdmlkZXIoe1xuICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdJVEhVQl9JRCB8fCBcIlwiLFxuICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HSVRIVUJfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUgfSkge1xuICAgICAgY29uc29sZS5sb2coXCJTaWduSW4gY2FsbGJhY2s6XCIsIHsgXG4gICAgICAgIHVzZXI6IHVzZXIgPyB7IGlkOiB1c2VyLmlkLCBuYW1lOiB1c2VyLm5hbWUsIGVtYWlsOiB1c2VyLmVtYWlsIH0gOiBudWxsLFxuICAgICAgICBhY2NvdW50OiBhY2NvdW50ID8geyBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlciwgdHlwZTogYWNjb3VudC50eXBlIH0gOiBudWxsLFxuICAgICAgICBwcm9maWxlOiBwcm9maWxlID8geyBlbWFpbDogcHJvZmlsZS5lbWFpbCB9IDogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBBbGxvdyBzaWduIGluIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgYWNjb3VudCBpcyBhbHJlYWR5IGxpbmtlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciwgYWNjb3VudCwgdHJpZ2dlciwgc2Vzc2lvbiB9KSB7XG4gICAgICAvLyBJbml0aWFsIHNpZ24gaW5cbiAgICAgIGlmIChhY2NvdW50ICYmIHVzZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2sgKGluaXRpYWwgc2lnbiBpbik6XCIsIHtcbiAgICAgICAgICBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlcixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4gPyBcIlByb3ZpZGVkXCIgOiBcIk1pc3NpbmdcIixcbiAgICAgICAgICByZWZyZXNoVG9rZW46IGFjY291bnQucmVmcmVzaF90b2tlbiA/IFwiUHJvdmlkZWRcIiA6IFwiTWlzc2luZ1wiLFxuICAgICAgICAgIGV4cGlyZXNBdDogYWNjb3VudC5leHBpcmVzX2F0LFxuICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi50b2tlbixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgcmVmcmVzaFRva2VuOiBhY2NvdW50LnJlZnJlc2hfdG9rZW4sXG4gICAgICAgICAgYWNjZXNzVG9rZW5FeHBpcmVzOiBhY2NvdW50LmV4cGlyZXNfYXQgPyBhY2NvdW50LmV4cGlyZXNfYXQgKiAxMDAwIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHVzZXJSb2xlOiBcInVzZXJcIixcbiAgICAgICAgICB1c2VySWQ6IHVzZXIuaWQsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSB1cGRhdGVzXG4gICAgICBpZiAodHJpZ2dlciA9PT0gJ3VwZGF0ZScgJiYgc2Vzc2lvbikge1xuICAgICAgICByZXR1cm4geyAuLi50b2tlbiwgLi4uc2Vzc2lvbiB9O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gcHJldmlvdXMgdG9rZW4gaWYgdGhlIGFjY2VzcyB0b2tlbiBoYXMgbm90IGV4cGlyZWQgeWV0XG4gICAgICBpZiAodG9rZW4uYWNjZXNzVG9rZW5FeHBpcmVzICYmIERhdGUubm93KCkgPCB0b2tlbi5hY2Nlc3NUb2tlbkV4cGlyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFVzaW5nIGV4aXN0aW5nIHRva2VuIChub3QgZXhwaXJlZClcIik7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFRva2VuIG1heSBiZSBleHBpcmVkIG9yIG1pc3NpbmcgZXhwaXJlcyB0aW1lXCIpO1xuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIC8vIFRoaXMgaXMgbm93IGFsd2F5cyBjYWxsZWQgd2l0aCBhIHRva2VuLCBub3QgYSB1c2VyXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXNzaW9uIGNhbGxiYWNrIHdpdGggdG9rZW46XCIsIHsgXG4gICAgICAgICAgdXNlcklkOiB0b2tlbi51c2VySWQsXG4gICAgICAgICAgYWNjZXNzVG9rZW46IHRva2VuLmFjY2Vzc1Rva2VuID8gXCJQcm92aWRlZFwiIDogXCJNaXNzaW5nXCIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgYWNjZXNzIHRva2VuIGFuZCB1c2VyIElEIHRvIHRoZSBzZXNzaW9uXG4gICAgICAgIHNlc3Npb24uYWNjZXNzVG9rZW4gPSB0b2tlbi5hY2Nlc3NUb2tlbjtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4udXNlcklkIHx8IHRva2VuLnN1YjtcbiAgICAgICAgXG4gICAgICAgIC8vIEZldGNoIHVzZXIgcm9sZSBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGlmIChzZXNzaW9uLnVzZXIuaWQpIHtcbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBpZDogc2Vzc2lvbi51c2VyLmlkIH0sXG4gICAgICAgICAgICBzZWxlY3Q6IHsgcm9sZTogdHJ1ZSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB1c2VyPy5yb2xlIHx8ICdVU0VSJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogXCIvbG9naW5cIixcbiAgICBlcnJvcjogXCIvbG9naW5cIiwgLy8gRXJyb3IgcGFnZVxuICB9LFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIixcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogXCJqd3RcIiwgLy8gSW1wb3J0YW50OiB1c2UgSldUIHN0cmF0ZWd5IHRvIG1ha2UgdGhlIHRva2VuIGF2YWlsYWJsZVxuICAgIG1heEFnZTogMjQgKiA2MCAqIDYwLCAvLyAyNCBob3Vyc1xuICB9LFxuICBsb2dnZXI6IHtcbiAgICBlcnJvcihjb2RlLCBtZXRhZGF0YSkge1xuICAgICAgY29uc29sZS5lcnJvcihgTmV4dEF1dGggRXJyb3I6ICR7Y29kZX1gLCBtZXRhZGF0YSk7XG4gICAgfSxcbiAgICB3YXJuKGNvZGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgTmV4dEF1dGggV2FybmluZzogJHtjb2RlfWApO1xuICAgIH0sXG4gICAgZGVidWcoY29kZSwgbWV0YWRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBOZXh0QXV0aCBEZWJ1ZzogJHtjb2RlfWAsIG1ldGFkYXRhKTtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9OyJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIlByaXNtYUFkYXB0ZXIiLCJHaXRodWJQcm92aWRlciIsIkdvb2dsZVByb3ZpZGVyIiwicHJpc21hIiwiY29uc29sZSIsImxvZyIsImdvb2dsZUlkIiwicHJvY2VzcyIsImVudiIsIkdPT0dMRV9DTElFTlRfSUQiLCJnb29nbGVTZWNyZXQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsIm5leHRBdXRoVXJsIiwiTkVYVEFVVEhfVVJMIiwibmV4dEF1dGhTZWNyZXQiLCJORVhUQVVUSF9TRUNSRVQiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsImF1dGhvcml6YXRpb24iLCJwYXJhbXMiLCJzY29wZSIsInByb21wdCIsImFjY2Vzc190eXBlIiwicmVzcG9uc2VfdHlwZSIsImFsbG93RGFuZ2Vyb3VzRW1haWxBY2NvdW50TGlua2luZyIsIkdJVEhVQl9JRCIsIkdJVEhVQl9TRUNSRVQiLCJjYWxsYmFja3MiLCJzaWduSW4iLCJ1c2VyIiwiYWNjb3VudCIsInByb2ZpbGUiLCJpZCIsIm5hbWUiLCJlbWFpbCIsInByb3ZpZGVyIiwidHlwZSIsImp3dCIsInRva2VuIiwidHJpZ2dlciIsInNlc3Npb24iLCJhY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsInJlZnJlc2hUb2tlbiIsInJlZnJlc2hfdG9rZW4iLCJleHBpcmVzQXQiLCJleHBpcmVzX2F0IiwiYWNjZXNzVG9rZW5FeHBpcmVzIiwidW5kZWZpbmVkIiwidXNlclJvbGUiLCJ1c2VySWQiLCJEYXRlIiwibm93Iiwic3ViIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwic2VsZWN0Iiwicm9sZSIsInBhZ2VzIiwiZXJyb3IiLCJkZWJ1ZyIsInNlY3JldCIsInN0cmF0ZWd5IiwibWF4QWdlIiwibG9nZ2VyIiwiY29kZSIsIm1ldGFkYXRhIiwid2FybiIsImhhbmRsZXIiLCJHRVQiLCJQT1NUIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/weather/route.ts":
/*!**********************************!*\
  !*** ./app/api/weather/route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/app/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n// OpenWeatherMap - Free tier: 1000 calls/day\nconst WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';\nconst WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';\nasync function GET(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Unauthorized'\n            }, {\n                status: 401\n            });\n        }\n        const searchParams = request.nextUrl.searchParams;\n        const lat = searchParams.get('lat');\n        const lon = searchParams.get('lon');\n        if (!lat || !lon) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Latitude and longitude required'\n            }, {\n                status: 400\n            });\n        }\n        if (!WEATHER_API_KEY) {\n            console.warn('OPENWEATHER_API_KEY not found. Please get a free API key from https://openweathermap.org/api');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Weather API key not configured',\n                message: 'Get a free key at https://openweathermap.org/api'\n            }, {\n                status: 500\n            });\n        }\n        // Fetch current weather\n        const currentWeatherUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=nl`;\n        const forecastUrl = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=nl&cnt=5`;\n        const [currentResponse, forecastResponse] = await Promise.all([\n            fetch(currentWeatherUrl),\n            fetch(forecastUrl)\n        ]);\n        if (!currentResponse.ok || !forecastResponse.ok) {\n            throw new Error('Failed to fetch weather data');\n        }\n        const currentData = await currentResponse.json();\n        const forecastData = await forecastResponse.json();\n        // Parse forecast data - get daily max temps\n        const dailyForecasts = forecastData.list.map((item)=>({\n                day: new Date(item.dt * 1000).toLocaleDateString('nl-NL', {\n                    weekday: 'short'\n                }),\n                temperature: Math.round(item.main.temp),\n                condition: item.weather[0].main\n            }));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            temperature: Math.round(currentData.main.temp),\n            feels_like: Math.round(currentData.main.feels_like),\n            condition: currentData.weather[0].main,\n            description: currentData.weather[0].description,\n            location: currentData.name,\n            humidity: currentData.main.humidity,\n            wind_speed: Math.round(currentData.wind.speed * 3.6),\n            forecast: dailyForecasts\n        });\n    } catch (error) {\n        console.error('Error fetching weather:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to fetch weather data'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFLE9BQU9yQixPQUFPO1FBQ2RPLFFBQVFQLEtBQUssQ0FBQywyQkFBMkJBO1FBQ3pDLE9BQU9aLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBK0IsR0FDeEM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy95dXN0aW50cm9vc3QvRG9jdW1lbnRzL3NpdGVzL3l1c3Rib2FyZC9hcHAvYXBpL3dlYXRoZXIvcm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gJ25leHQtYXV0aCdcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZSdcblxuLy8gT3BlbldlYXRoZXJNYXAgLSBGcmVlIHRpZXI6IDEwMDAgY2FsbHMvZGF5XG5jb25zdCBXRUFUSEVSX0FQSV9LRVkgPSBwcm9jZXNzLmVudi5PUEVOV0VBVEhFUl9BUElfS0VZIHx8ICcnXG5jb25zdCBXRUFUSEVSX0FQSV9VUkwgPSAnaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41J1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KVxuICAgIH1cblxuICAgIGNvbnN0IHNlYXJjaFBhcmFtcyA9IHJlcXVlc3QubmV4dFVybC5zZWFyY2hQYXJhbXNcbiAgICBjb25zdCBsYXQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdsYXQnKVxuICAgIGNvbnN0IGxvbiA9IHNlYXJjaFBhcmFtcy5nZXQoJ2xvbicpXG4gICAgXG4gICAgaWYgKCFsYXQgfHwgIWxvbikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdMYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIHJlcXVpcmVkJyB9LCB7IHN0YXR1czogNDAwIH0pXG4gICAgfVxuICAgIFxuICAgIGlmICghV0VBVEhFUl9BUElfS0VZKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ09QRU5XRUFUSEVSX0FQSV9LRVkgbm90IGZvdW5kLiBQbGVhc2UgZ2V0IGEgZnJlZSBBUEkga2V5IGZyb20gaHR0cHM6Ly9vcGVud2VhdGhlcm1hcC5vcmcvYXBpJylcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICAgIGVycm9yOiAnV2VhdGhlciBBUEkga2V5IG5vdCBjb25maWd1cmVkJyxcbiAgICAgICAgbWVzc2FnZTogJ0dldCBhIGZyZWUga2V5IGF0IGh0dHBzOi8vb3BlbndlYXRoZXJtYXAub3JnL2FwaSdcbiAgICAgIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgICB9XG5cbiAgICAvLyBGZXRjaCBjdXJyZW50IHdlYXRoZXJcbiAgICBjb25zdCBjdXJyZW50V2VhdGhlclVybCA9IGAke1dFQVRIRVJfQVBJX1VSTH0vd2VhdGhlcj9sYXQ9JHtsYXR9Jmxvbj0ke2xvbn0mYXBwaWQ9JHtXRUFUSEVSX0FQSV9LRVl9JnVuaXRzPW1ldHJpYyZsYW5nPW5sYFxuICAgIGNvbnN0IGZvcmVjYXN0VXJsID0gYCR7V0VBVEhFUl9BUElfVVJMfS9mb3JlY2FzdD9sYXQ9JHtsYXR9Jmxvbj0ke2xvbn0mYXBwaWQ9JHtXRUFUSEVSX0FQSV9LRVl9JnVuaXRzPW1ldHJpYyZsYW5nPW5sJmNudD01YFxuICAgIFxuICAgIGNvbnN0IFtjdXJyZW50UmVzcG9uc2UsIGZvcmVjYXN0UmVzcG9uc2VdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgZmV0Y2goY3VycmVudFdlYXRoZXJVcmwpLFxuICAgICAgZmV0Y2goZm9yZWNhc3RVcmwpXG4gICAgXSlcblxuICAgIGlmICghY3VycmVudFJlc3BvbnNlLm9rIHx8ICFmb3JlY2FzdFJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCB3ZWF0aGVyIGRhdGEnKVxuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnREYXRhID0gYXdhaXQgY3VycmVudFJlc3BvbnNlLmpzb24oKVxuICAgIGNvbnN0IGZvcmVjYXN0RGF0YSA9IGF3YWl0IGZvcmVjYXN0UmVzcG9uc2UuanNvbigpXG5cbiAgICAvLyBQYXJzZSBmb3JlY2FzdCBkYXRhIC0gZ2V0IGRhaWx5IG1heCB0ZW1wc1xuICAgIGNvbnN0IGRhaWx5Rm9yZWNhc3RzID0gZm9yZWNhc3REYXRhLmxpc3QubWFwKChpdGVtOiBhbnkpID0+ICh7XG4gICAgICBkYXk6IG5ldyBEYXRlKGl0ZW0uZHQgKiAxMDAwKS50b0xvY2FsZURhdGVTdHJpbmcoJ25sLU5MJywgeyB3ZWVrZGF5OiAnc2hvcnQnIH0pLFxuICAgICAgdGVtcGVyYXR1cmU6IE1hdGgucm91bmQoaXRlbS5tYWluLnRlbXApLFxuICAgICAgY29uZGl0aW9uOiBpdGVtLndlYXRoZXJbMF0ubWFpblxuICAgIH0pKVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHRlbXBlcmF0dXJlOiBNYXRoLnJvdW5kKGN1cnJlbnREYXRhLm1haW4udGVtcCksXG4gICAgICBmZWVsc19saWtlOiBNYXRoLnJvdW5kKGN1cnJlbnREYXRhLm1haW4uZmVlbHNfbGlrZSksXG4gICAgICBjb25kaXRpb246IGN1cnJlbnREYXRhLndlYXRoZXJbMF0ubWFpbixcbiAgICAgIGRlc2NyaXB0aW9uOiBjdXJyZW50RGF0YS53ZWF0aGVyWzBdLmRlc2NyaXB0aW9uLFxuICAgICAgbG9jYXRpb246IGN1cnJlbnREYXRhLm5hbWUsXG4gICAgICBodW1pZGl0eTogY3VycmVudERhdGEubWFpbi5odW1pZGl0eSxcbiAgICAgIHdpbmRfc3BlZWQ6IE1hdGgucm91bmQoY3VycmVudERhdGEud2luZC5zcGVlZCAqIDMuNiksIC8vIENvbnZlcnQgbS9zIHRvIGttL2hcbiAgICAgIGZvcmVjYXN0OiBkYWlseUZvcmVjYXN0c1xuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgd2VhdGhlcjonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHdlYXRoZXIgZGF0YScgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgIClcbiAgfVxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJXRUFUSEVSX0FQSV9LRVkiLCJwcm9jZXNzIiwiZW52IiwiT1BFTldFQVRIRVJfQVBJX0tFWSIsIldFQVRIRVJfQVBJX1VSTCIsIkdFVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwic2VhcmNoUGFyYW1zIiwibmV4dFVybCIsImxhdCIsImdldCIsImxvbiIsImNvbnNvbGUiLCJ3YXJuIiwibWVzc2FnZSIsImN1cnJlbnRXZWF0aGVyVXJsIiwiZm9yZWNhc3RVcmwiLCJjdXJyZW50UmVzcG9uc2UiLCJmb3JlY2FzdFJlc3BvbnNlIiwiUHJvbWlzZSIsImFsbCIsImZldGNoIiwib2siLCJFcnJvciIsImN1cnJlbnREYXRhIiwiZm9yZWNhc3REYXRhIiwiZGFpbHlGb3JlY2FzdHMiLCJsaXN0IiwibWFwIiwiaXRlbSIsImRheSIsIkRhdGUiLCJkdCIsInRvTG9jYWxlRGF0ZVN0cmluZyIsIndlZWtkYXkiLCJ0ZW1wZXJhdHVyZSIsIk1hdGgiLCJyb3VuZCIsIm1haW4iLCJ0ZW1wIiwiY29uZGl0aW9uIiwid2VhdGhlciIsImZlZWxzX2xpa2UiLCJkZXNjcmlwdGlvbiIsImxvY2F0aW9uIiwibmFtZSIsImh1bWlkaXR5Iiwid2luZF9zcGVlZCIsIndpbmQiLCJzcGVlZCIsImZvcmVjYXN0Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/weather/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) {\n    global.prisma = prisma;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBOEM7QUFZdkMsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQSxHQUFHO0FBRTFELElBQUlHLElBQXFDLEVBQUU7SUFDekNELE9BQU9ELE1BQU0sR0FBR0E7QUFDbEI7QUFFQSxpRUFBZUEsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2xpYi9wcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuXG4vLyBQcmlzbWFDbGllbnQgaXMgYXR0YWNoZWQgdG8gdGhlIGBnbG9iYWxgIG9iamVjdCBpbiBkZXZlbG9wbWVudCB0byBwcmV2ZW50XG4vLyBleGhhdXN0aW5nIHlvdXIgZGF0YWJhc2UgY29ubmVjdGlvbiBsaW1pdC5cbi8vXG4vLyBMZWFybiBtb3JlOiBcbi8vIGh0dHBzOi8vcHJpcy5seS9kL2hlbHAvbmV4dC1qcy1iZXN0LXByYWN0aWNlc1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHZhciBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBnbG9iYWwucHJpc21hID0gcHJpc21hO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7Il0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsInByaXNtYSIsImdsb2JhbCIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fweather%2Froute&page=%2Fapi%2Fweather%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fweather%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fweather%2Froute&page=%2Fapi%2Fweather%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fweather%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yustintroost_Documents_sites_yustboard_app_api_weather_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/weather/route.ts */ \"(rsc)/./app/api/weather/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/weather/route\",\n        pathname: \"/api/weather\",\n        filename: \"route\",\n        bundlePath: \"app/api/weather/route\"\n    },\n    resolvedPagePath: \"/Users/yustintroost/Documents/sites/yustboard/app/api/weather/route.ts\",\n    nextConfigOutput,\n    userland: _Users_yustintroost_Documents_sites_yustboard_app_api_weather_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ3ZWF0aGVyJTJGcm91dGUmcGFnZT0lMkZhcGklMkZ3ZWF0aGVyJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGd2VhdGhlciUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNzQjtBQUNuRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvd2VhdGhlci9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvd2VhdGhlci9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3dlYXRoZXJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3dlYXRoZXIvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMveXVzdGludHJvb3N0L0RvY3VtZW50cy9zaXRlcy95dXN0Ym9hcmQvYXBwL2FwaS93ZWF0aGVyL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fweather%2Froute&page=%2Fapi%2Fweather%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fweather%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/lru-cache","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/@auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fweather%2Froute&page=%2Fapi%2Fweather%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fweather%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();