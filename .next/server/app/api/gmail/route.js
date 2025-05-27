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
exports.id = "app/api/gmail/route";
exports.ids = ["app/api/gmail/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/github */ \"(rsc)/./node_modules/next-auth/providers/github.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n\n// For debugging purposes\nconsole.log(\"NextAuth Config:\", {\n    googleId: process.env.GOOGLE_CLIENT_ID ? \"Set\" : \"Not set\",\n    googleSecret: process.env.GOOGLE_CLIENT_SECRET ? \"Set\" : \"Not set\",\n    nextAuthUrl: process.env.NEXTAUTH_URL,\n    nextAuthSecret: process.env.NEXTAUTH_SECRET ? \"Set\" : \"Not set\"\n});\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"]),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID || \"\",\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET || \"\",\n            authorization: {\n                params: {\n                    scope: \"openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read\",\n                    prompt: \"consent\",\n                    access_type: \"offline\",\n                    response_type: \"code\"\n                }\n            },\n            allowDangerousEmailAccountLinking: true\n        }),\n        (0,next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.GITHUB_ID || \"\",\n            clientSecret: process.env.GITHUB_SECRET || \"\",\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            console.log(\"SignIn callback:\", {\n                user: user ? {\n                    id: user.id,\n                    name: user.name,\n                    email: user.email\n                } : null,\n                account: account ? {\n                    provider: account.provider,\n                    type: account.type\n                } : null,\n                profile: profile ? {\n                    email: profile.email\n                } : null\n            });\n            // Allow sign in regardless of whether the account is already linked\n            return true;\n        },\n        async jwt ({ token, user, account, trigger, session }) {\n            // Initial sign in\n            if (account && user) {\n                console.log(\"JWT callback (initial sign in):\", {\n                    provider: account.provider,\n                    accessToken: account.access_token ? \"Provided\" : \"Missing\",\n                    refreshToken: account.refresh_token ? \"Provided\" : \"Missing\",\n                    expiresAt: account.expires_at\n                });\n                return {\n                    ...token,\n                    accessToken: account.access_token,\n                    refreshToken: account.refresh_token,\n                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,\n                    userRole: \"user\",\n                    userId: user.id\n                };\n            }\n            // Handle updates\n            if (trigger === 'update' && session) {\n                return {\n                    ...token,\n                    ...session\n                };\n            }\n            // Return previous token if the access token has not expired yet\n            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {\n                console.log(\"JWT callback: Using existing token (not expired)\");\n                return token;\n            }\n            console.log(\"JWT callback: Token may be expired or missing expires time\");\n            return token;\n        },\n        async session ({ session, token }) {\n            // This is now always called with a token, not a user\n            if (token) {\n                console.log(\"Session callback with token:\", {\n                    userId: token.userId,\n                    accessToken: token.accessToken ? \"Provided\" : \"Missing\"\n                });\n                // Add the access token and user ID to the session\n                session.accessToken = token.accessToken;\n                session.user.id = token.userId || token.sub;\n                // Fetch user role from database\n                if (session.user.id) {\n                    const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"].user.findUnique({\n                        where: {\n                            id: session.user.id\n                        },\n                        select: {\n                            role: true\n                        }\n                    });\n                    session.user.role = user?.role || 'USER';\n                }\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    debug: \"development\" === \"development\",\n    secret: process.env.NEXTAUTH_SECRET,\n    session: {\n        strategy: \"jwt\",\n        maxAge: 24 * 60 * 60\n    },\n    logger: {\n        error (code, metadata) {\n            console.error(`NextAuth Error: ${code}`, metadata);\n        },\n        warn (code) {\n            console.warn(`NextAuth Warning: ${code}`);\n        },\n        debug (code, metadata) {\n            console.log(`NextAuth Debug: ${code}`, metadata);\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBaUM7QUFDb0I7QUFDRztBQUNBO0FBQ3RCO0FBRWxDLHlCQUF5QjtBQUN6QkssUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtJQUM5QkMsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0IsR0FBRyxRQUFRO0lBQ2pEQyxjQUFjSCxRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixHQUFHLFFBQVE7SUFDekRDLGFBQWFMLFFBQVFDLEdBQUcsQ0FBQ0ssWUFBWTtJQUNyQ0MsZ0JBQWdCUCxRQUFRQyxHQUFHLENBQUNPLGVBQWUsR0FBRyxRQUFRO0FBQ3hEO0FBRU8sTUFBTUMsY0FBYztJQUN6QkMsU0FBU2pCLG1FQUFhQSxDQUFDRyxtREFBTUE7SUFDN0JlLFdBQVc7UUFDVGhCLHNFQUFjQSxDQUFDO1lBQ2JpQixVQUFVWixRQUFRQyxHQUFHLENBQUNDLGdCQUFnQixJQUFJO1lBQzFDVyxjQUFjYixRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixJQUFJO1lBQ2xEVSxlQUFlO2dCQUNiQyxRQUFRO29CQUNOQyxPQUFPO29CQUNQQyxRQUFRO29CQUNSQyxhQUFhO29CQUNiQyxlQUFlO2dCQUNqQjtZQUNGO1lBQ0FDLG1DQUFtQztRQUNyQztRQUNBMUIsc0VBQWNBLENBQUM7WUFDYmtCLFVBQVVaLFFBQVFDLEdBQUcsQ0FBQ29CLFNBQVMsSUFBSTtZQUNuQ1IsY0FBY2IsUUFBUUMsR0FBRyxDQUFDcUIsYUFBYSxJQUFJO1lBQzNDRixtQ0FBbUM7UUFDckM7S0FDRDtJQUNERyxXQUFXO1FBQ1QsTUFBTUMsUUFBTyxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFO1lBQ3JDOUIsUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtnQkFDOUIyQixNQUFNQSxPQUFPO29CQUFFRyxJQUFJSCxLQUFLRyxFQUFFO29CQUFFQyxNQUFNSixLQUFLSSxJQUFJ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RUFBRUYsTUFBTTtRQUMxQztRQUNBTCxPQUFNSyxJQUFJLEVBQUVDLFFBQVE7WUFDbEJqRSxRQUFRQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRStELE1BQU0sRUFBRUM7UUFDekM7SUFDRjtBQUNGLEVBQUU7QUFFRixNQUFNRSxVQUFVeEUsZ0RBQVFBLENBQUNpQjtBQUVrQiIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSBcIkBhdXRoL3ByaXNtYS1hZGFwdGVyXCI7XG5pbXBvcnQgR2l0aHViUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ2l0aHViXCI7XG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcblxuLy8gRm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xuY29uc29sZS5sb2coXCJOZXh0QXV0aCBDb25maWc6XCIsIHtcbiAgZ29vZ2xlSWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIGdvb2dsZVNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIG5leHRBdXRoVXJsOiBwcm9jZXNzLmVudi5ORVhUQVVUSF9VUkwsXG4gIG5leHRBdXRoU2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG59KTtcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zID0ge1xuICBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIEdvb2dsZVByb3ZpZGVyKHtcbiAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIHx8IFwiXCIsXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhdXRob3JpemF0aW9uOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHNjb3BlOiBcIm9wZW5pZCBlbWFpbCBwcm9maWxlIGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvY2FsZW5kYXIgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9jYWxlbmRhci5ldmVudHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5yZWFkb25seSBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLm1ldGFkYXRhLnJlYWRvbmx5IGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHkgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5sYWJlbHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmFjdGl2aXR5LnJlYWQgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmJvZHkucmVhZFwiLFxuICAgICAgICAgIHByb21wdDogXCJjb25zZW50XCIsXG4gICAgICAgICAgYWNjZXNzX3R5cGU6IFwib2ZmbGluZVwiLFxuICAgICAgICAgIHJlc3BvbnNlX3R5cGU6IFwiY29kZVwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gICAgR2l0aHViUHJvdmlkZXIoe1xuICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdJVEhVQl9JRCB8fCBcIlwiLFxuICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HSVRIVUJfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUgfSkge1xuICAgICAgY29uc29sZS5sb2coXCJTaWduSW4gY2FsbGJhY2s6XCIsIHsgXG4gICAgICAgIHVzZXI6IHVzZXIgPyB7IGlkOiB1c2VyLmlkLCBuYW1lOiB1c2VyLm5hbWUsIGVtYWlsOiB1c2VyLmVtYWlsIH0gOiBudWxsLFxuICAgICAgICBhY2NvdW50OiBhY2NvdW50ID8geyBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlciwgdHlwZTogYWNjb3VudC50eXBlIH0gOiBudWxsLFxuICAgICAgICBwcm9maWxlOiBwcm9maWxlID8geyBlbWFpbDogcHJvZmlsZS5lbWFpbCB9IDogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBBbGxvdyBzaWduIGluIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgYWNjb3VudCBpcyBhbHJlYWR5IGxpbmtlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciwgYWNjb3VudCwgdHJpZ2dlciwgc2Vzc2lvbiB9KSB7XG4gICAgICAvLyBJbml0aWFsIHNpZ24gaW5cbiAgICAgIGlmIChhY2NvdW50ICYmIHVzZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2sgKGluaXRpYWwgc2lnbiBpbik6XCIsIHtcbiAgICAgICAgICBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlcixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4gPyBcIlByb3ZpZGVkXCIgOiBcIk1pc3NpbmdcIixcbiAgICAgICAgICByZWZyZXNoVG9rZW46IGFjY291bnQucmVmcmVzaF90b2tlbiA/IFwiUHJvdmlkZWRcIiA6IFwiTWlzc2luZ1wiLFxuICAgICAgICAgIGV4cGlyZXNBdDogYWNjb3VudC5leHBpcmVzX2F0LFxuICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi50b2tlbixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgcmVmcmVzaFRva2VuOiBhY2NvdW50LnJlZnJlc2hfdG9rZW4sXG4gICAgICAgICAgYWNjZXNzVG9rZW5FeHBpcmVzOiBhY2NvdW50LmV4cGlyZXNfYXQgPyBhY2NvdW50LmV4cGlyZXNfYXQgKiAxMDAwIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHVzZXJSb2xlOiBcInVzZXJcIixcbiAgICAgICAgICB1c2VySWQ6IHVzZXIuaWQsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSB1cGRhdGVzXG4gICAgICBpZiAodHJpZ2dlciA9PT0gJ3VwZGF0ZScgJiYgc2Vzc2lvbikge1xuICAgICAgICByZXR1cm4geyAuLi50b2tlbiwgLi4uc2Vzc2lvbiB9O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gcHJldmlvdXMgdG9rZW4gaWYgdGhlIGFjY2VzcyB0b2tlbiBoYXMgbm90IGV4cGlyZWQgeWV0XG4gICAgICBpZiAodG9rZW4uYWNjZXNzVG9rZW5FeHBpcmVzICYmIERhdGUubm93KCkgPCB0b2tlbi5hY2Nlc3NUb2tlbkV4cGlyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFVzaW5nIGV4aXN0aW5nIHRva2VuIChub3QgZXhwaXJlZClcIik7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFRva2VuIG1heSBiZSBleHBpcmVkIG9yIG1pc3NpbmcgZXhwaXJlcyB0aW1lXCIpO1xuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIC8vIFRoaXMgaXMgbm93IGFsd2F5cyBjYWxsZWQgd2l0aCBhIHRva2VuLCBub3QgYSB1c2VyXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXNzaW9uIGNhbGxiYWNrIHdpdGggdG9rZW46XCIsIHsgXG4gICAgICAgICAgdXNlcklkOiB0b2tlbi51c2VySWQsXG4gICAgICAgICAgYWNjZXNzVG9rZW46IHRva2VuLmFjY2Vzc1Rva2VuID8gXCJQcm92aWRlZFwiIDogXCJNaXNzaW5nXCIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgYWNjZXNzIHRva2VuIGFuZCB1c2VyIElEIHRvIHRoZSBzZXNzaW9uXG4gICAgICAgIHNlc3Npb24uYWNjZXNzVG9rZW4gPSB0b2tlbi5hY2Nlc3NUb2tlbjtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4udXNlcklkIHx8IHRva2VuLnN1YjtcbiAgICAgICAgXG4gICAgICAgIC8vIEZldGNoIHVzZXIgcm9sZSBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGlmIChzZXNzaW9uLnVzZXIuaWQpIHtcbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBpZDogc2Vzc2lvbi51c2VyLmlkIH0sXG4gICAgICAgICAgICBzZWxlY3Q6IHsgcm9sZTogdHJ1ZSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB1c2VyPy5yb2xlIHx8ICdVU0VSJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogXCIvbG9naW5cIixcbiAgICBlcnJvcjogXCIvbG9naW5cIiwgLy8gRXJyb3IgcGFnZVxuICB9LFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIixcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogXCJqd3RcIiwgLy8gSW1wb3J0YW50OiB1c2UgSldUIHN0cmF0ZWd5IHRvIG1ha2UgdGhlIHRva2VuIGF2YWlsYWJsZVxuICAgIG1heEFnZTogMjQgKiA2MCAqIDYwLCAvLyAyNCBob3Vyc1xuICB9LFxuICBsb2dnZXI6IHtcbiAgICBlcnJvcihjb2RlLCBtZXRhZGF0YSkge1xuICAgICAgY29uc29sZS5lcnJvcihgTmV4dEF1dGggRXJyb3I6ICR7Y29kZX1gLCBtZXRhZGF0YSk7XG4gICAgfSxcbiAgICB3YXJuKGNvZGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgTmV4dEF1dGggV2FybmluZzogJHtjb2RlfWApO1xuICAgIH0sXG4gICAgZGVidWcoY29kZSwgbWV0YWRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBOZXh0QXV0aCBEZWJ1ZzogJHtjb2RlfWAsIG1ldGFkYXRhKTtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9OyJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIlByaXNtYUFkYXB0ZXIiLCJHaXRodWJQcm92aWRlciIsIkdvb2dsZVByb3ZpZGVyIiwicHJpc21hIiwiY29uc29sZSIsImxvZyIsImdvb2dsZUlkIiwicHJvY2VzcyIsImVudiIsIkdPT0dMRV9DTElFTlRfSUQiLCJnb29nbGVTZWNyZXQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsIm5leHRBdXRoVXJsIiwiTkVYVEFVVEhfVVJMIiwibmV4dEF1dGhTZWNyZXQiLCJORVhUQVVUSF9TRUNSRVQiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsImF1dGhvcml6YXRpb24iLCJwYXJhbXMiLCJzY29wZSIsInByb21wdCIsImFjY2Vzc190eXBlIiwicmVzcG9uc2VfdHlwZSIsImFsbG93RGFuZ2Vyb3VzRW1haWxBY2NvdW50TGlua2luZyIsIkdJVEhVQl9JRCIsIkdJVEhVQl9TRUNSRVQiLCJjYWxsYmFja3MiLCJzaWduSW4iLCJ1c2VyIiwiYWNjb3VudCIsInByb2ZpbGUiLCJpZCIsIm5hbWUiLCJlbWFpbCIsInByb3ZpZGVyIiwidHlwZSIsImp3dCIsInRva2VuIiwidHJpZ2dlciIsInNlc3Npb24iLCJhY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsInJlZnJlc2hUb2tlbiIsInJlZnJlc2hfdG9rZW4iLCJleHBpcmVzQXQiLCJleHBpcmVzX2F0IiwiYWNjZXNzVG9rZW5FeHBpcmVzIiwidW5kZWZpbmVkIiwidXNlclJvbGUiLCJ1c2VySWQiLCJEYXRlIiwibm93Iiwic3ViIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwic2VsZWN0Iiwicm9sZSIsInBhZ2VzIiwiZXJyb3IiLCJkZWJ1ZyIsInNlY3JldCIsInN0cmF0ZWd5IiwibWF4QWdlIiwibG9nZ2VyIiwiY29kZSIsIm1ldGFkYXRhIiwid2FybiIsImhhbmRsZXIiLCJHRVQiLCJQT1NUIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/gmail/route.ts":
/*!********************************!*\
  !*** ./app/api/gmail/route.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/app/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n/* harmony import */ var _utils_google_gmail__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/google-gmail */ \"(rsc)/./utils/google-gmail.ts\");\n\n\n\n\nasync function GET(request) {\n    try {\n        // Get the user's session\n        const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session?.accessToken) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Unauthorized - No access token available'\n            }, {\n                status: 401\n            });\n        }\n        // Parse query parameters\n        const { searchParams } = new URL(request.url);\n        const maxResults = searchParams.get('max') ? parseInt(searchParams.get('max'), 10) : 10;\n        const query = searchParams.get('query') || 'in:inbox';\n        const pageToken = searchParams.get('pageToken') || undefined;\n        const countsOnly = searchParams.get('countsOnly') === 'true';\n        // If countsOnly is true, return only email counts\n        if (countsOnly) {\n            const counts = await (0,_utils_google_gmail__WEBPACK_IMPORTED_MODULE_3__.getEmailCounts)(session.accessToken);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                counts\n            });\n        }\n        // Otherwise, fetch emails\n        const result = await (0,_utils_google_gmail__WEBPACK_IMPORTED_MODULE_3__.fetchEmails)(session.accessToken, maxResults, query, pageToken);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(result);\n    } catch (error) {\n        console.error('Error in Gmail API route:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to fetch emails'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2dtYWlsL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQTJDO0FBQ087QUFDZTtBQUNFO0FBRTVELGVBQWVLLElBQUlDLE9BQWdCO0lBQ3hDLElBQUk7UUFDRix5QkFBeUI7UUFDekIsTUFBTUMsVUFBVSxNQUFNTixnRUFBZ0JBLENBQUNDLHFFQUFXQTtRQUVsRCxJQUFJLENBQUNLLFNBQVNDLGFBQWE7WUFDekIsT0FBT1IscURBQVlBLENBQUNTLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBMkMsR0FDcEQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLHlCQUF5QjtRQUN6QixNQUFNLEVBQUVDLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUlQLFFBQVFRLEdBQUc7UUFDNUMsTUFBTUMsYUFBYUgsYUFBYUksR0FBRyxDQUFDLFNBQVNDLFNBQVNMLGFBQWFJLEdBQUcsQ0FBQyxRQUFrQixNQUFNO1FBQy9GLE1BQU1FLFFBQVFOLGFBQWFJLEdBQUcsQ0FBQyxZQUFZO1FBQzNDLE1BQU1HLFlBQVlQLGFBQWFJLEdBQUcsQ0FBQyxnQkFBZ0JJO1FBQ25ELE1BQU1DLGFBQWFULGFBQWFJLEdBQUcsQ0FBQyxrQkFBa0I7UUFFdEQsa0RBQWtEO1FBQ2xELElBQUlLLFlBQVk7WUFDZCxNQUFNQyxTQUFTLE1BQU1sQixtRUFBY0EsQ0FBQ0csUUFBUUMsV0FBVztZQUN2RCxPQUFPUixxREFBWUEsQ0FBQ1MsSUFBSSxDQUFDO2dCQUFFYTtZQUFPO1FBQ3BDO1FBRUEsMEJBQTBCO1FBQzFCLE1BQU1DLFNBQVMsTUFBTXBCLGdFQUFXQSxDQUM5QkksUUFBUUMsV0FBVyxFQUNuQk8sWUFDQUcsT0FDQUM7UUFHRixPQUFPbkIscURBQVlBLENBQUNTLElBQUksQ0FBQ2M7SUFDM0IsRUFBRSxPQUFPYixPQUFPO1FBQ2RjLFFBQVFkLEtBQUssQ0FBQyw2QkFBNkJBO1FBRTNDLE9BQU9WLHFEQUFZQSxDQUFDUyxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBeUIsR0FDbEM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy95dXN0aW50cm9vc3QvRG9jdW1lbnRzL3NpdGVzL3l1c3Rib2FyZC9hcHAvYXBpL2dtYWlsL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgvbmV4dCc7XG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUnO1xuaW1wb3J0IHsgZmV0Y2hFbWFpbHMsIGdldEVtYWlsQ291bnRzIH0gZnJvbSAnQC91dGlscy9nb29nbGUtZ21haWwnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICAvLyBHZXQgdGhlIHVzZXIncyBzZXNzaW9uXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xuICAgIFxuICAgIGlmICghc2Vzc2lvbj8uYWNjZXNzVG9rZW4pIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogJ1VuYXV0aG9yaXplZCAtIE5vIGFjY2VzcyB0b2tlbiBhdmFpbGFibGUnIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDEgfVxuICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUGFyc2UgcXVlcnkgcGFyYW1ldGVyc1xuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAgICBjb25zdCBtYXhSZXN1bHRzID0gc2VhcmNoUGFyYW1zLmdldCgnbWF4JykgPyBwYXJzZUludChzZWFyY2hQYXJhbXMuZ2V0KCdtYXgnKSBhcyBzdHJpbmcsIDEwKSA6IDEwO1xuICAgIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoUGFyYW1zLmdldCgncXVlcnknKSB8fCAnaW46aW5ib3gnO1xuICAgIGNvbnN0IHBhZ2VUb2tlbiA9IHNlYXJjaFBhcmFtcy5nZXQoJ3BhZ2VUb2tlbicpIHx8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBjb3VudHNPbmx5ID0gc2VhcmNoUGFyYW1zLmdldCgnY291bnRzT25seScpID09PSAndHJ1ZSc7XG4gICAgXG4gICAgLy8gSWYgY291bnRzT25seSBpcyB0cnVlLCByZXR1cm4gb25seSBlbWFpbCBjb3VudHNcbiAgICBpZiAoY291bnRzT25seSkge1xuICAgICAgY29uc3QgY291bnRzID0gYXdhaXQgZ2V0RW1haWxDb3VudHMoc2Vzc2lvbi5hY2Nlc3NUb2tlbik7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBjb3VudHMgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIE90aGVyd2lzZSwgZmV0Y2ggZW1haWxzXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2hFbWFpbHMoXG4gICAgICBzZXNzaW9uLmFjY2Vzc1Rva2VuLFxuICAgICAgbWF4UmVzdWx0cyxcbiAgICAgIHF1ZXJ5LFxuICAgICAgcGFnZVRva2VuIGFzIHN0cmluZyB8IHVuZGVmaW5lZFxuICAgICk7XG4gICAgXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHJlc3VsdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gR21haWwgQVBJIHJvdXRlOicsIGVycm9yKTtcbiAgICBcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGVtYWlscycgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICk7XG4gIH1cbn0iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwiZmV0Y2hFbWFpbHMiLCJnZXRFbWFpbENvdW50cyIsIkdFVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwiYWNjZXNzVG9rZW4iLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJtYXhSZXN1bHRzIiwiZ2V0IiwicGFyc2VJbnQiLCJxdWVyeSIsInBhZ2VUb2tlbiIsInVuZGVmaW5lZCIsImNvdW50c09ubHkiLCJjb3VudHMiLCJyZXN1bHQiLCJjb25zb2xlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/gmail/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) {\n    global.prisma = prisma;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBOEM7QUFZdkMsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQSxHQUFHO0FBRTFELElBQUlHLElBQXFDLEVBQUU7SUFDekNELE9BQU9ELE1BQU0sR0FBR0E7QUFDbEI7QUFFQSxpRUFBZUEsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2xpYi9wcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuXG4vLyBQcmlzbWFDbGllbnQgaXMgYXR0YWNoZWQgdG8gdGhlIGBnbG9iYWxgIG9iamVjdCBpbiBkZXZlbG9wbWVudCB0byBwcmV2ZW50XG4vLyBleGhhdXN0aW5nIHlvdXIgZGF0YWJhc2UgY29ubmVjdGlvbiBsaW1pdC5cbi8vXG4vLyBMZWFybiBtb3JlOiBcbi8vIGh0dHBzOi8vcHJpcy5seS9kL2hlbHAvbmV4dC1qcy1iZXN0LXByYWN0aWNlc1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHZhciBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBnbG9iYWwucHJpc21hID0gcHJpc21hO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7Il0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsInByaXNtYSIsImdsb2JhbCIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgmail%2Froute&page=%2Fapi%2Fgmail%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgmail%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgmail%2Froute&page=%2Fapi%2Fgmail%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgmail%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yustintroost_Documents_sites_yustboard_app_api_gmail_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/gmail/route.ts */ \"(rsc)/./app/api/gmail/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/gmail/route\",\n        pathname: \"/api/gmail\",\n        filename: \"route\",\n        bundlePath: \"app/api/gmail/route\"\n    },\n    resolvedPagePath: \"/Users/yustintroost/Documents/sites/yustboard/app/api/gmail/route.ts\",\n    nextConfigOutput,\n    userland: _Users_yustintroost_Documents_sites_yustboard_app_api_gmail_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZnbWFpbCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGZ21haWwlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZnbWFpbCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNvQjtBQUNqRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvZ21haWwvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2dtYWlsL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZ21haWxcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2dtYWlsL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvZ21haWwvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgmail%2Froute&page=%2Fapi%2Fgmail%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgmail%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./utils/google-gmail.ts":
/*!*******************************!*\
  !*** ./utils/google-gmail.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   fetchEmailById: () => (/* binding */ fetchEmailById),\n/* harmony export */   fetchEmails: () => (/* binding */ fetchEmails),\n/* harmony export */   fetchGmailLabels: () => (/* binding */ fetchGmailLabels),\n/* harmony export */   getEmailCounts: () => (/* binding */ getEmailCounts),\n/* harmony export */   getGmailClient: () => (/* binding */ getGmailClient),\n/* harmony export */   markAsRead: () => (/* binding */ markAsRead),\n/* harmony export */   toggleStar: () => (/* binding */ toggleStar)\n/* harmony export */ });\n/* harmony import */ var googleapis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! googleapis */ \"(rsc)/./node_modules/googleapis/build/src/index.js\");\n\n// Initialize Gmail API client\nasync function getGmailClient(accessToken) {\n    if (!accessToken) {\n        throw new Error(\"Access token is required for Gmail API\");\n    }\n    console.log(\"Initializing Gmail client with access token\");\n    const auth = new googleapis__WEBPACK_IMPORTED_MODULE_0__.google.auth.OAuth2();\n    auth.setCredentials({\n        access_token: accessToken\n    });\n    return googleapis__WEBPACK_IMPORTED_MODULE_0__.google.gmail({\n        version: 'v1',\n        auth\n    });\n}\n// Extract email from header value (e.g., \"John Doe <john@example.com>\" -> { name: \"John Doe\", email: \"john@example.com\" })\nfunction parseEmailAddress(headerValue) {\n    if (!headerValue) {\n        return {\n            email: 'unknown@example.com'\n        };\n    }\n    // Check if the format is \"Name <email>\"\n    const match = headerValue.match(/^(.*?)\\s*<([^>]+)>$/);\n    if (match) {\n        return {\n            name: match[1].trim().replace(/[\"']/g, ''),\n            email: match[2].trim()\n        };\n    }\n    // If not in that format, assume it's just an email\n    return {\n        email: headerValue.trim()\n    };\n}\n// Parse \"To\" header which may contain multiple recipients\nfunction parseToAddresses(headerValue) {\n    if (!headerValue) {\n        return [];\n    }\n    // Split by commas, then extract email parts\n    return headerValue.split(',').map((part)=>{\n        const parsed = parseEmailAddress(part.trim());\n        return parsed.email;\n    }).filter(Boolean);\n}\n// Extract a specific header value from Gmail message\nfunction getHeader(message, name) {\n    if (!message.payload?.headers) return undefined;\n    const header = message.payload.headers.find((h)=>h.name.toLowerCase() === name.toLowerCase());\n    return header?.value;\n}\n// Decode base64 content\nfunction decodeBase64(data) {\n    // Convert from URL-safe base64 to standard base64\n    const base64Data = data.replace(/-/g, '+').replace(/_/g, '/');\n    try {\n        // For browser environment\n        return atob(base64Data);\n    } catch (e) {\n        // For Node.js environment\n        return Buffer.from(base64Data, 'base64').toString('utf-8');\n    }\n}\n// Extract email body content from parts\nfunction extractBodyContent(payload) {\n    // If the message is a simple text or HTML\n    if (payload.body?.data) {\n        return decodeBase64(payload.body.data);\n    }\n    // If the message has parts (multipart message)\n    if (payload.parts && payload.parts.length) {\n        // First try to find an HTML part\n        const htmlPart = payload.parts.find((part)=>part.mimeType === 'text/html');\n        if (htmlPart && htmlPart.body?.data) {\n            return decodeBase64(htmlPart.body.data);\n        }\n        // If no HTML part, try to find a text part\n        const textPart = payload.parts.find((part)=>part.mimeType === 'text/plain');\n        if (textPart && textPart.body?.data) {\n            return decodeBase64(textPart.body.data);\n        }\n        // If no HTML or text part at this level, recursively check nested parts\n        for (const part of payload.parts){\n            if (part.parts) {\n                const nestedContent = extractBodyContent(part);\n                if (nestedContent) {\n                    return nestedContent;\n                }\n            }\n        }\n    }\n    return '';\n}\n// Convert Gmail raw message to app email format\nfunction convertGmailMessageToEmail(message) {\n    const fromHeader = getHeader(message, 'From') || '';\n    const from = parseEmailAddress(fromHeader);\n    const toHeader = getHeader(message, 'To');\n    const to = parseToAddresses(toHeader);\n    const subject = getHeader(message, 'Subject') || '(No Subject)';\n    const dateHeader = getHeader(message, 'Date');\n    const date = dateHeader ? new Date(dateHeader) : new Date();\n    const isRead = !message.labelIds?.includes('UNREAD');\n    const isStarred = message.labelIds?.includes('STARRED') || false;\n    const hasAttachments = message.payload?.mimeType?.includes('multipart') || false;\n    // Extract body content if payload is available\n    let body = '';\n    if (message.payload) {\n        body = extractBodyContent(message.payload);\n    }\n    return {\n        id: message.id,\n        threadId: message.threadId,\n        from,\n        to,\n        subject,\n        snippet: message.snippet || '',\n        body,\n        date,\n        isRead,\n        isStarred,\n        hasAttachments,\n        labels: message.labelIds || [],\n        sizeEstimate: message.sizeEstimate\n    };\n}\n// Fetch user's Gmail labels\nasync function fetchGmailLabels(accessToken) {\n    try {\n        const gmail = await getGmailClient(accessToken);\n        const response = await gmail.users.labels.list({\n            userId: 'me'\n        });\n        return response.data.labels || [];\n    } catch (error) {\n        console.error('Error fetching Gmail labels:', error);\n        throw error;\n    }\n}\n// Fetch emails from inbox with pagination\nasync function fetchEmails(accessToken, maxResults = 10, query = 'in:inbox', pageToken) {\n    try {\n        console.log(`Fetching emails with query: ${query}`);\n        const gmail = await getGmailClient(accessToken);\n        // First, list message IDs based on the query\n        const messagesResponse = await gmail.users.messages.list({\n            userId: 'me',\n            maxResults,\n            q: query,\n            pageToken\n        });\n        const messageIds = messagesResponse.data.messages || [];\n        console.log(`Found ${messageIds.length} messages`);\n        if (messageIds.length === 0) {\n            return {\n                emails: []\n            };\n        }\n        // Then, fetch full messages for each ID\n        const emails = await Promise.all(messageIds.map(async ({ id, threadId })=>{\n            if (!id) return null;\n            const messageResponse = await gmail.users.messages.get({\n                userId: 'me',\n                id,\n                format: 'metadata',\n                metadataHeaders: [\n                    'From',\n                    'To',\n                    'Subject',\n                    'Date'\n                ]\n            });\n            return convertGmailMessageToEmail(messageResponse.data);\n        }));\n        return {\n            emails: emails.filter(Boolean),\n            nextPageToken: messagesResponse.data.nextPageToken\n        };\n    } catch (error) {\n        console.error('Error fetching emails:', error);\n        // Show more detailed error information\n        if (error instanceof Error) {\n            console.error('Error message:', error.message);\n            console.error('Error stack:', error.stack);\n        }\n        // Return empty array rather than failing completely\n        return {\n            emails: []\n        };\n    }\n}\n// Fetch a specific email by ID\nasync function fetchEmailById(accessToken, messageId) {\n    try {\n        console.log(`Fetching email with ID: ${messageId}`);\n        const gmail = await getGmailClient(accessToken);\n        const messageResponse = await gmail.users.messages.get({\n            userId: 'me',\n            id: messageId,\n            format: 'full'\n        });\n        return convertGmailMessageToEmail(messageResponse.data);\n    } catch (error) {\n        console.error(`Error fetching email ${messageId}:`, error);\n        return null;\n    }\n}\n// Mark an email as read\nasync function markAsRead(accessToken, messageId) {\n    try {\n        const gmail = await getGmailClient(accessToken);\n        await gmail.users.messages.modify({\n            userId: 'me',\n            id: messageId,\n            requestBody: {\n                removeLabelIds: [\n                    'UNREAD'\n                ]\n            }\n        });\n        return true;\n    } catch (error) {\n        console.error(`Error marking email ${messageId} as read:`, error);\n        return false;\n    }\n}\n// Toggle star status of an email\nasync function toggleStar(accessToken, messageId, star) {\n    try {\n        const gmail = await getGmailClient(accessToken);\n        const requestBody = star ? {\n            addLabelIds: [\n                'STARRED'\n            ]\n        } : {\n            removeLabelIds: [\n                'STARRED'\n            ]\n        };\n        await gmail.users.messages.modify({\n            userId: 'me',\n            id: messageId,\n            requestBody\n        });\n        return true;\n    } catch (error) {\n        console.error(`Error toggling star for email ${messageId}:`, error);\n        return false;\n    }\n}\n// Get email counts by label/category\nasync function getEmailCounts(accessToken) {\n    try {\n        const gmail = await getGmailClient(accessToken);\n        // Get all user labels\n        const labelsResponse = await gmail.users.labels.list({\n            userId: 'me'\n        });\n        const labels = labelsResponse.data.labels || [];\n        const counts = {};\n        // Get counts for important system labels\n        const importantLabels = [\n            'INBOX',\n            'UNREAD',\n            'STARRED',\n            'IMPORTANT',\n            'SENT',\n            'DRAFT',\n            'SPAM',\n            'TRASH'\n        ];\n        for (const labelName of importantLabels){\n            const label = labels.find((l)=>l.id === labelName);\n            if (label) {\n                counts[labelName.toLowerCase()] = label.messagesUnread || 0;\n            }\n        }\n        return counts;\n    } catch (error) {\n        console.error('Error getting email counts:', error);\n        return {};\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNGO0FBRUEscUNBQXFDO0FBQzlCLGVBQWUyQixlQUNwQnBHLFdBQW1CO0lBRW5CLElBQUk7UUFDRixNQUFNUSxRQUFRLE1BQU1ULGVBQWVDO1FBRW5DLHNCQUFzQjtRQUN0QixNQUFNcUcsaUJBQWlCLE1BQU03RixNQUFNOEQsS0FBSyxDQUFDSixNQUFNLENBQUNLLElBQUksQ0FBQztZQUNuREMsUUFBUTtRQUNWO1FBRUEsTUFBTU4sU0FBU21DLGVBQWVsRSxJQUFJLENBQUMrQixNQUFNLElBQUksRUFBRTtRQUMvQyxNQUFNb0MsU0FBc0MsQ0FBQztRQUU3Qyx5Q0FBeUM7UUFDekMsTUFBTUMsa0JBQWtCO1lBQUM7WUFBUztZQUFVO1lBQVc7WUFBYTtZQUFRO1lBQVM7WUFBUTtTQUFRO1FBRXJHLEtBQUssTUFBTUMsYUFBYUQsZ0JBQWlCO1lBQ3ZDLE1BQU1FLFFBQVF2QyxPQUFPcEMsSUFBSSxDQUFDNEUsQ0FBQUEsSUFBS0EsRUFBRTNDLEVBQUUsS0FBS3lDO1lBQ3hDLElBQUlDLE9BQU87Z0JBQ1RILE1BQU0sQ0FBQ0UsVUFBVXhFLFdBQVcsR0FBRyxHQUFHeUUsTUFBTUUsY0FBYyxJQUFJO1lBQzVEO1FBQ0Y7UUFFQSxPQUFPTDtJQUNULEVBQUUsT0FBTzdCLE9BQU87UUFDZHZFLFFBQVF1RSxLQUFLLENBQUMsK0JBQStCQTtRQUM3QyxPQUFPLENBQUM7SUFDVjtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMveXVzdGludHJvb3N0L0RvY3VtZW50cy9zaXRlcy95dXN0Ym9hcmQvdXRpbHMvZ29vZ2xlLWdtYWlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdvb2dsZSB9IGZyb20gJ2dvb2dsZWFwaXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdtYWlsTWVzc2FnZSB7XG4gIGlkOiBzdHJpbmc7XG4gIHRocmVhZElkOiBzdHJpbmc7XG4gIGxhYmVsSWRzOiBzdHJpbmdbXTtcbiAgc25pcHBldDogc3RyaW5nO1xuICBoaXN0b3J5SWQ6IHN0cmluZztcbiAgaW50ZXJuYWxEYXRlOiBzdHJpbmc7XG4gIHBheWxvYWQ6IHtcbiAgICBwYXJ0SWQ/OiBzdHJpbmc7XG4gICAgbWltZVR5cGU/OiBzdHJpbmc7XG4gICAgZmlsZW5hbWU/OiBzdHJpbmc7XG4gICAgaGVhZGVyczogQXJyYXk8e1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHN0cmluZztcbiAgICB9PjtcbiAgICBib2R5Pzoge1xuICAgICAgc2l6ZTogbnVtYmVyO1xuICAgICAgZGF0YT86IHN0cmluZztcbiAgICB9O1xuICAgIHBhcnRzPzogYW55W107XG4gIH07XG4gIHNpemVFc3RpbWF0ZTogbnVtYmVyO1xuICByYXc/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW1haWxNZXNzYWdlIHtcbiAgaWQ6IHN0cmluZztcbiAgdGhyZWFkSWQ6IHN0cmluZztcbiAgZnJvbToge1xuICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgZW1haWw6IHN0cmluZztcbiAgfTtcbiAgdG86IHN0cmluZ1tdO1xuICBzdWJqZWN0OiBzdHJpbmc7XG4gIHNuaXBwZXQ6IHN0cmluZztcbiAgYm9keT86IHN0cmluZztcbiAgZGF0ZTogRGF0ZSB8IHN0cmluZztcbiAgaXNSZWFkOiBib29sZWFuO1xuICBpc1N0YXJyZWQ6IGJvb2xlYW47XG4gIGhhc0F0dGFjaG1lbnRzOiBib29sZWFuO1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICBzaXplRXN0aW1hdGU6IG51bWJlcjtcbn1cblxuLy8gSW5pdGlhbGl6ZSBHbWFpbCBBUEkgY2xpZW50XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R21haWxDbGllbnQoYWNjZXNzVG9rZW46IHN0cmluZykge1xuICBpZiAoIWFjY2Vzc1Rva2VuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQWNjZXNzIHRva2VuIGlzIHJlcXVpcmVkIGZvciBHbWFpbCBBUElcIik7XG4gIH1cbiAgXG4gIGNvbnNvbGUubG9nKFwiSW5pdGlhbGl6aW5nIEdtYWlsIGNsaWVudCB3aXRoIGFjY2VzcyB0b2tlblwiKTtcbiAgY29uc3QgYXV0aCA9IG5ldyBnb29nbGUuYXV0aC5PQXV0aDIoKTtcbiAgYXV0aC5zZXRDcmVkZW50aWFscyh7IGFjY2Vzc190b2tlbjogYWNjZXNzVG9rZW4gfSk7XG4gIHJldHVybiBnb29nbGUuZ21haWwoeyB2ZXJzaW9uOiAndjEnLCBhdXRoIH0pO1xufVxuXG4vLyBFeHRyYWN0IGVtYWlsIGZyb20gaGVhZGVyIHZhbHVlIChlLmcuLCBcIkpvaG4gRG9lIDxqb2huQGV4YW1wbGUuY29tPlwiIC0+IHsgbmFtZTogXCJKb2huIERvZVwiLCBlbWFpbDogXCJqb2huQGV4YW1wbGUuY29tXCIgfSlcbmZ1bmN0aW9uIHBhcnNlRW1haWxBZGRyZXNzKGhlYWRlclZhbHVlOiBzdHJpbmcpOiB7IG5hbWU/OiBzdHJpbmc7IGVtYWlsOiBzdHJpbmcgfSB7XG4gIGlmICghaGVhZGVyVmFsdWUpIHtcbiAgICByZXR1cm4geyBlbWFpbDogJ3Vua25vd25AZXhhbXBsZS5jb20nIH07XG4gIH1cbiAgXG4gIC8vIENoZWNrIGlmIHRoZSBmb3JtYXQgaXMgXCJOYW1lIDxlbWFpbD5cIlxuICBjb25zdCBtYXRjaCA9IGhlYWRlclZhbHVlLm1hdGNoKC9eKC4qPylcXHMqPChbXj5dKyk+JC8pO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4geyBcbiAgICAgIG5hbWU6IG1hdGNoWzFdLnRyaW0oKS5yZXBsYWNlKC9bXCInXS9nLCAnJyksIFxuICAgICAgZW1haWw6IG1hdGNoWzJdLnRyaW0oKSBcbiAgICB9O1xuICB9XG4gIFxuICAvLyBJZiBub3QgaW4gdGhhdCBmb3JtYXQsIGFzc3VtZSBpdCdzIGp1c3QgYW4gZW1haWxcbiAgcmV0dXJuIHsgZW1haWw6IGhlYWRlclZhbHVlLnRyaW0oKSB9O1xufVxuXG4vLyBQYXJzZSBcIlRvXCIgaGVhZGVyIHdoaWNoIG1heSBjb250YWluIG11bHRpcGxlIHJlY2lwaWVudHNcbmZ1bmN0aW9uIHBhcnNlVG9BZGRyZXNzZXMoaGVhZGVyVmFsdWU/OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGlmICghaGVhZGVyVmFsdWUpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgXG4gIC8vIFNwbGl0IGJ5IGNvbW1hcywgdGhlbiBleHRyYWN0IGVtYWlsIHBhcnRzXG4gIHJldHVybiBoZWFkZXJWYWx1ZVxuICAgIC5zcGxpdCgnLCcpXG4gICAgLm1hcChwYXJ0ID0+IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRW1haWxBZGRyZXNzKHBhcnQudHJpbSgpKTtcbiAgICAgIHJldHVybiBwYXJzZWQuZW1haWw7XG4gICAgfSlcbiAgICAuZmlsdGVyKEJvb2xlYW4pO1xufVxuXG4vLyBFeHRyYWN0IGEgc3BlY2lmaWMgaGVhZGVyIHZhbHVlIGZyb20gR21haWwgbWVzc2FnZVxuZnVuY3Rpb24gZ2V0SGVhZGVyKG1lc3NhZ2U6IEdtYWlsTWVzc2FnZSwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFtZXNzYWdlLnBheWxvYWQ/LmhlYWRlcnMpIHJldHVybiB1bmRlZmluZWQ7XG4gIFxuICBjb25zdCBoZWFkZXIgPSBtZXNzYWdlLnBheWxvYWQuaGVhZGVycy5maW5kKFxuICAgIGggPT4gaC5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKVxuICApO1xuICBcbiAgcmV0dXJuIGhlYWRlcj8udmFsdWU7XG59XG5cbi8vIERlY29kZSBiYXNlNjQgY29udGVudFxuZnVuY3Rpb24gZGVjb2RlQmFzZTY0KGRhdGE6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIENvbnZlcnQgZnJvbSBVUkwtc2FmZSBiYXNlNjQgdG8gc3RhbmRhcmQgYmFzZTY0XG4gIGNvbnN0IGJhc2U2NERhdGEgPSBkYXRhLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJyk7XG4gIFxuICB0cnkge1xuICAgIC8vIEZvciBicm93c2VyIGVudmlyb25tZW50XG4gICAgcmV0dXJuIGF0b2IoYmFzZTY0RGF0YSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBGb3IgTm9kZS5qcyBlbnZpcm9ubWVudFxuICAgIHJldHVybiBCdWZmZXIuZnJvbShiYXNlNjREYXRhLCAnYmFzZTY0JykudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gIH1cbn1cblxuLy8gRXh0cmFjdCBlbWFpbCBib2R5IGNvbnRlbnQgZnJvbSBwYXJ0c1xuZnVuY3Rpb24gZXh0cmFjdEJvZHlDb250ZW50KHBheWxvYWQ6IGFueSk6IHN0cmluZyB7XG4gIC8vIElmIHRoZSBtZXNzYWdlIGlzIGEgc2ltcGxlIHRleHQgb3IgSFRNTFxuICBpZiAocGF5bG9hZC5ib2R5Py5kYXRhKSB7XG4gICAgcmV0dXJuIGRlY29kZUJhc2U2NChwYXlsb2FkLmJvZHkuZGF0YSk7XG4gIH1cbiAgXG4gIC8vIElmIHRoZSBtZXNzYWdlIGhhcyBwYXJ0cyAobXVsdGlwYXJ0IG1lc3NhZ2UpXG4gIGlmIChwYXlsb2FkLnBhcnRzICYmIHBheWxvYWQucGFydHMubGVuZ3RoKSB7XG4gICAgLy8gRmlyc3QgdHJ5IHRvIGZpbmQgYW4gSFRNTCBwYXJ0XG4gICAgY29uc3QgaHRtbFBhcnQgPSBwYXlsb2FkLnBhcnRzLmZpbmQoKHBhcnQ6IGFueSkgPT4gXG4gICAgICBwYXJ0Lm1pbWVUeXBlID09PSAndGV4dC9odG1sJ1xuICAgICk7XG4gICAgXG4gICAgaWYgKGh0bWxQYXJ0ICYmIGh0bWxQYXJ0LmJvZHk/LmRhdGEpIHtcbiAgICAgIHJldHVybiBkZWNvZGVCYXNlNjQoaHRtbFBhcnQuYm9keS5kYXRhKTtcbiAgICB9XG4gICAgXG4gICAgLy8gSWYgbm8gSFRNTCBwYXJ0LCB0cnkgdG8gZmluZCBhIHRleHQgcGFydFxuICAgIGNvbnN0IHRleHRQYXJ0ID0gcGF5bG9hZC5wYXJ0cy5maW5kKChwYXJ0OiBhbnkpID0+IFxuICAgICAgcGFydC5taW1lVHlwZSA9PT0gJ3RleHQvcGxhaW4nXG4gICAgKTtcbiAgICBcbiAgICBpZiAodGV4dFBhcnQgJiYgdGV4dFBhcnQuYm9keT8uZGF0YSkge1xuICAgICAgcmV0dXJuIGRlY29kZUJhc2U2NCh0ZXh0UGFydC5ib2R5LmRhdGEpO1xuICAgIH1cbiAgICBcbiAgICAvLyBJZiBubyBIVE1MIG9yIHRleHQgcGFydCBhdCB0aGlzIGxldmVsLCByZWN1cnNpdmVseSBjaGVjayBuZXN0ZWQgcGFydHNcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGF5bG9hZC5wYXJ0cykge1xuICAgICAgaWYgKHBhcnQucGFydHMpIHtcbiAgICAgICAgY29uc3QgbmVzdGVkQ29udGVudCA9IGV4dHJhY3RCb2R5Q29udGVudChwYXJ0KTtcbiAgICAgICAgaWYgKG5lc3RlZENvbnRlbnQpIHtcbiAgICAgICAgICByZXR1cm4gbmVzdGVkQ29udGVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuICcnO1xufVxuXG4vLyBDb252ZXJ0IEdtYWlsIHJhdyBtZXNzYWdlIHRvIGFwcCBlbWFpbCBmb3JtYXRcbmZ1bmN0aW9uIGNvbnZlcnRHbWFpbE1lc3NhZ2VUb0VtYWlsKG1lc3NhZ2U6IEdtYWlsTWVzc2FnZSk6IEVtYWlsTWVzc2FnZSB7XG4gIGNvbnN0IGZyb21IZWFkZXIgPSBnZXRIZWFkZXIobWVzc2FnZSwgJ0Zyb20nKSB8fCAnJztcbiAgY29uc3QgZnJvbSA9IHBhcnNlRW1haWxBZGRyZXNzKGZyb21IZWFkZXIpO1xuICBcbiAgY29uc3QgdG9IZWFkZXIgPSBnZXRIZWFkZXIobWVzc2FnZSwgJ1RvJyk7XG4gIGNvbnN0IHRvID0gcGFyc2VUb0FkZHJlc3Nlcyh0b0hlYWRlcik7XG4gIFxuICBjb25zdCBzdWJqZWN0ID0gZ2V0SGVhZGVyKG1lc3NhZ2UsICdTdWJqZWN0JykgfHwgJyhObyBTdWJqZWN0KSc7XG4gIFxuICBjb25zdCBkYXRlSGVhZGVyID0gZ2V0SGVhZGVyKG1lc3NhZ2UsICdEYXRlJyk7XG4gIGNvbnN0IGRhdGUgPSBkYXRlSGVhZGVyID8gbmV3IERhdGUoZGF0ZUhlYWRlcikgOiBuZXcgRGF0ZSgpO1xuICBcbiAgY29uc3QgaXNSZWFkID0gIW1lc3NhZ2UubGFiZWxJZHM/LmluY2x1ZGVzKCdVTlJFQUQnKTtcbiAgY29uc3QgaXNTdGFycmVkID0gbWVzc2FnZS5sYWJlbElkcz8uaW5jbHVkZXMoJ1NUQVJSRUQnKSB8fCBmYWxzZTtcbiAgY29uc3QgaGFzQXR0YWNobWVudHMgPSBtZXNzYWdlLnBheWxvYWQ/Lm1pbWVUeXBlPy5pbmNsdWRlcygnbXVsdGlwYXJ0JykgfHwgZmFsc2U7XG4gIFxuICAvLyBFeHRyYWN0IGJvZHkgY29udGVudCBpZiBwYXlsb2FkIGlzIGF2YWlsYWJsZVxuICBsZXQgYm9keSA9ICcnO1xuICBpZiAobWVzc2FnZS5wYXlsb2FkKSB7XG4gICAgYm9keSA9IGV4dHJhY3RCb2R5Q29udGVudChtZXNzYWdlLnBheWxvYWQpO1xuICB9XG4gIFxuICByZXR1cm4ge1xuICAgIGlkOiBtZXNzYWdlLmlkLFxuICAgIHRocmVhZElkOiBtZXNzYWdlLnRocmVhZElkLFxuICAgIGZyb20sXG4gICAgdG8sXG4gICAgc3ViamVjdCxcbiAgICBzbmlwcGV0OiBtZXNzYWdlLnNuaXBwZXQgfHwgJycsXG4gICAgYm9keSxcbiAgICBkYXRlLFxuICAgIGlzUmVhZCxcbiAgICBpc1N0YXJyZWQsXG4gICAgaGFzQXR0YWNobWVudHMsXG4gICAgbGFiZWxzOiBtZXNzYWdlLmxhYmVsSWRzIHx8IFtdLFxuICAgIHNpemVFc3RpbWF0ZTogbWVzc2FnZS5zaXplRXN0aW1hdGVcbiAgfTtcbn1cblxuLy8gRmV0Y2ggdXNlcidzIEdtYWlsIGxhYmVsc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoR21haWxMYWJlbHMoYWNjZXNzVG9rZW46IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGdtYWlsID0gYXdhaXQgZ2V0R21haWxDbGllbnQoYWNjZXNzVG9rZW4pO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ21haWwudXNlcnMubGFiZWxzLmxpc3Qoe1xuICAgICAgdXNlcklkOiAnbWUnLFxuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLmxhYmVscyB8fCBbXTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBHbWFpbCBsYWJlbHM6JywgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8vIEZldGNoIGVtYWlscyBmcm9tIGluYm94IHdpdGggcGFnaW5hdGlvblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoRW1haWxzKFxuICBhY2Nlc3NUb2tlbjogc3RyaW5nLFxuICBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMCxcbiAgcXVlcnk6IHN0cmluZyA9ICdpbjppbmJveCcsXG4gIHBhZ2VUb2tlbj86IHN0cmluZ1xuKTogUHJvbWlzZTx7IGVtYWlsczogRW1haWxNZXNzYWdlW107IG5leHRQYWdlVG9rZW4/OiBzdHJpbmcgfT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBGZXRjaGluZyBlbWFpbHMgd2l0aCBxdWVyeTogJHtxdWVyeX1gKTtcbiAgICBjb25zdCBnbWFpbCA9IGF3YWl0IGdldEdtYWlsQ2xpZW50KGFjY2Vzc1Rva2VuKTtcbiAgICBcbiAgICAvLyBGaXJzdCwgbGlzdCBtZXNzYWdlIElEcyBiYXNlZCBvbiB0aGUgcXVlcnlcbiAgICBjb25zdCBtZXNzYWdlc1Jlc3BvbnNlID0gYXdhaXQgZ21haWwudXNlcnMubWVzc2FnZXMubGlzdCh7XG4gICAgICB1c2VySWQ6ICdtZScsXG4gICAgICBtYXhSZXN1bHRzLFxuICAgICAgcTogcXVlcnksXG4gICAgICBwYWdlVG9rZW4sXG4gICAgfSk7XG4gICAgXG4gICAgY29uc3QgbWVzc2FnZUlkcyA9IG1lc3NhZ2VzUmVzcG9uc2UuZGF0YS5tZXNzYWdlcyB8fCBbXTtcbiAgICBjb25zb2xlLmxvZyhgRm91bmQgJHttZXNzYWdlSWRzLmxlbmd0aH0gbWVzc2FnZXNgKTtcbiAgICBcbiAgICBpZiAobWVzc2FnZUlkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IGVtYWlsczogW10gfTtcbiAgICB9XG4gICAgXG4gICAgLy8gVGhlbiwgZmV0Y2ggZnVsbCBtZXNzYWdlcyBmb3IgZWFjaCBJRFxuICAgIGNvbnN0IGVtYWlscyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgbWVzc2FnZUlkcy5tYXAoYXN5bmMgKHsgaWQsIHRocmVhZElkIH0pID0+IHtcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBtZXNzYWdlUmVzcG9uc2UgPSBhd2FpdCBnbWFpbC51c2Vycy5tZXNzYWdlcy5nZXQoe1xuICAgICAgICAgIHVzZXJJZDogJ21lJyxcbiAgICAgICAgICBpZCxcbiAgICAgICAgICBmb3JtYXQ6ICdtZXRhZGF0YScsIC8vICdmdWxsJyBmb3IgY29tcGxldGUgbWVzc2FnZSBjb250ZW50XG4gICAgICAgICAgbWV0YWRhdGFIZWFkZXJzOiBbJ0Zyb20nLCAnVG8nLCAnU3ViamVjdCcsICdEYXRlJ10sXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbnZlcnRHbWFpbE1lc3NhZ2VUb0VtYWlsKG1lc3NhZ2VSZXNwb25zZS5kYXRhIGFzIEdtYWlsTWVzc2FnZSk7XG4gICAgICB9KVxuICAgICk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGVtYWlsczogZW1haWxzLmZpbHRlcihCb29sZWFuKSBhcyBFbWFpbE1lc3NhZ2VbXSxcbiAgICAgIG5leHRQYWdlVG9rZW46IG1lc3NhZ2VzUmVzcG9uc2UuZGF0YS5uZXh0UGFnZVRva2VuLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZW1haWxzOicsIGVycm9yKTtcbiAgICBcbiAgICAvLyBTaG93IG1vcmUgZGV0YWlsZWQgZXJyb3IgaW5mb3JtYXRpb25cbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbWVzc2FnZTonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHN0YWNrOicsIGVycm9yLnN0YWNrKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUmV0dXJuIGVtcHR5IGFycmF5IHJhdGhlciB0aGFuIGZhaWxpbmcgY29tcGxldGVseVxuICAgIHJldHVybiB7IGVtYWlsczogW10gfTtcbiAgfVxufVxuXG4vLyBGZXRjaCBhIHNwZWNpZmljIGVtYWlsIGJ5IElEXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hFbWFpbEJ5SWQoXG4gIGFjY2Vzc1Rva2VuOiBzdHJpbmcsXG4gIG1lc3NhZ2VJZDogc3RyaW5nXG4pOiBQcm9taXNlPEVtYWlsTWVzc2FnZSB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhgRmV0Y2hpbmcgZW1haWwgd2l0aCBJRDogJHttZXNzYWdlSWR9YCk7XG4gICAgY29uc3QgZ21haWwgPSBhd2FpdCBnZXRHbWFpbENsaWVudChhY2Nlc3NUb2tlbik7XG4gICAgXG4gICAgY29uc3QgbWVzc2FnZVJlc3BvbnNlID0gYXdhaXQgZ21haWwudXNlcnMubWVzc2FnZXMuZ2V0KHtcbiAgICAgIHVzZXJJZDogJ21lJyxcbiAgICAgIGlkOiBtZXNzYWdlSWQsXG4gICAgICBmb3JtYXQ6ICdmdWxsJyxcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gY29udmVydEdtYWlsTWVzc2FnZVRvRW1haWwobWVzc2FnZVJlc3BvbnNlLmRhdGEgYXMgR21haWxNZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBmZXRjaGluZyBlbWFpbCAke21lc3NhZ2VJZH06YCwgZXJyb3IpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIE1hcmsgYW4gZW1haWwgYXMgcmVhZFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmtBc1JlYWQoXG4gIGFjY2Vzc1Rva2VuOiBzdHJpbmcsXG4gIG1lc3NhZ2VJZDogc3RyaW5nXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBnbWFpbCA9IGF3YWl0IGdldEdtYWlsQ2xpZW50KGFjY2Vzc1Rva2VuKTtcbiAgICBcbiAgICBhd2FpdCBnbWFpbC51c2Vycy5tZXNzYWdlcy5tb2RpZnkoe1xuICAgICAgdXNlcklkOiAnbWUnLFxuICAgICAgaWQ6IG1lc3NhZ2VJZCxcbiAgICAgIHJlcXVlc3RCb2R5OiB7XG4gICAgICAgIHJlbW92ZUxhYmVsSWRzOiBbJ1VOUkVBRCddLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBtYXJraW5nIGVtYWlsICR7bWVzc2FnZUlkfSBhcyByZWFkOmAsIGVycm9yKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gVG9nZ2xlIHN0YXIgc3RhdHVzIG9mIGFuIGVtYWlsXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlU3RhcihcbiAgYWNjZXNzVG9rZW46IHN0cmluZyxcbiAgbWVzc2FnZUlkOiBzdHJpbmcsXG4gIHN0YXI6IGJvb2xlYW5cbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGNvbnN0IGdtYWlsID0gYXdhaXQgZ2V0R21haWxDbGllbnQoYWNjZXNzVG9rZW4pO1xuICAgIFxuICAgIGNvbnN0IHJlcXVlc3RCb2R5ID0gc3RhclxuICAgICAgPyB7IGFkZExhYmVsSWRzOiBbJ1NUQVJSRUQnXSB9XG4gICAgICA6IHsgcmVtb3ZlTGFiZWxJZHM6IFsnU1RBUlJFRCddIH07XG4gICAgXG4gICAgYXdhaXQgZ21haWwudXNlcnMubWVzc2FnZXMubW9kaWZ5KHtcbiAgICAgIHVzZXJJZDogJ21lJyxcbiAgICAgIGlkOiBtZXNzYWdlSWQsXG4gICAgICByZXF1ZXN0Qm9keSxcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciB0b2dnbGluZyBzdGFyIGZvciBlbWFpbCAke21lc3NhZ2VJZH06YCwgZXJyb3IpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vLyBHZXQgZW1haWwgY291bnRzIGJ5IGxhYmVsL2NhdGVnb3J5XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RW1haWxDb3VudHMoXG4gIGFjY2Vzc1Rva2VuOiBzdHJpbmdcbik6IFByb21pc2U8eyBbbGFiZWw6IHN0cmluZ106IG51bWJlciB9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZ21haWwgPSBhd2FpdCBnZXRHbWFpbENsaWVudChhY2Nlc3NUb2tlbik7XG4gICAgXG4gICAgLy8gR2V0IGFsbCB1c2VyIGxhYmVsc1xuICAgIGNvbnN0IGxhYmVsc1Jlc3BvbnNlID0gYXdhaXQgZ21haWwudXNlcnMubGFiZWxzLmxpc3Qoe1xuICAgICAgdXNlcklkOiAnbWUnLFxuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IGxhYmVscyA9IGxhYmVsc1Jlc3BvbnNlLmRhdGEubGFiZWxzIHx8IFtdO1xuICAgIGNvbnN0IGNvdW50czogeyBbbGFiZWw6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gICAgXG4gICAgLy8gR2V0IGNvdW50cyBmb3IgaW1wb3J0YW50IHN5c3RlbSBsYWJlbHNcbiAgICBjb25zdCBpbXBvcnRhbnRMYWJlbHMgPSBbJ0lOQk9YJywgJ1VOUkVBRCcsICdTVEFSUkVEJywgJ0lNUE9SVEFOVCcsICdTRU5UJywgJ0RSQUZUJywgJ1NQQU0nLCAnVFJBU0gnXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGxhYmVsTmFtZSBvZiBpbXBvcnRhbnRMYWJlbHMpIHtcbiAgICAgIGNvbnN0IGxhYmVsID0gbGFiZWxzLmZpbmQobCA9PiBsLmlkID09PSBsYWJlbE5hbWUpO1xuICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgIGNvdW50c1tsYWJlbE5hbWUudG9Mb3dlckNhc2UoKV0gPSBsYWJlbC5tZXNzYWdlc1VucmVhZCB8fCAwO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gY291bnRzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgZW1haWwgY291bnRzOicsIGVycm9yKTtcbiAgICByZXR1cm4ge307XG4gIH1cbn0iXSwibmFtZXMiOlsiZ29vZ2xlIiwiZ2V0R21haWxDbGllbnQiLCJhY2Nlc3NUb2tlbiIsIkVycm9yIiwiY29uc29sZSIsImxvZyIsImF1dGgiLCJPQXV0aDIiLCJzZXRDcmVkZW50aWFscyIsImFjY2Vzc190b2tlbiIsImdtYWlsIiwidmVyc2lvbiIsInBhcnNlRW1haWxBZGRyZXNzIiwiaGVhZGVyVmFsdWUiLCJlbWFpbCIsIm1hdGNoIiwibmFtZSIsInRyaW0iLCJyZXBsYWNlIiwicGFyc2VUb0FkZHJlc3NlcyIsInNwbGl0IiwibWFwIiwicGFydCIsInBhcnNlZCIsImZpbHRlciIsIkJvb2xlYW4iLCJnZXRIZWFkZXIiLCJtZXNzYWdlIiwicGF5bG9hZCIsImhlYWRlcnMiLCJ1bmRlZmluZWQiLCJoZWFkZXIiLCJmaW5kIiwiaCIsInRvTG93ZXJDYXNlIiwidmFsdWUiLCJkZWNvZGVCYXNlNjQiLCJkYXRhIiwiYmFzZTY0RGF0YSIsImF0b2IiLCJlIiwiQnVmZmVyIiwiZnJvbSIsInRvU3RyaW5nIiwiZXh0cmFjdEJvZHlDb250ZW50IiwiYm9keSIsInBhcnRzIiwibGVuZ3RoIiwiaHRtbFBhcnQiLCJtaW1lVHlwZSIsInRleHRQYXJ0IiwibmVzdGVkQ29udGVudCIsImNvbnZlcnRHbWFpbE1lc3NhZ2VUb0VtYWlsIiwiZnJvbUhlYWRlciIsInRvSGVhZGVyIiwidG8iLCJzdWJqZWN0IiwiZGF0ZUhlYWRlciIsImRhdGUiLCJEYXRlIiwiaXNSZWFkIiwibGFiZWxJZHMiLCJpbmNsdWRlcyIsImlzU3RhcnJlZCIsImhhc0F0dGFjaG1lbnRzIiwiaWQiLCJ0aHJlYWRJZCIsInNuaXBwZXQiLCJsYWJlbHMiLCJzaXplRXN0aW1hdGUiLCJmZXRjaEdtYWlsTGFiZWxzIiwicmVzcG9uc2UiLCJ1c2VycyIsImxpc3QiLCJ1c2VySWQiLCJlcnJvciIsImZldGNoRW1haWxzIiwibWF4UmVzdWx0cyIsInF1ZXJ5IiwicGFnZVRva2VuIiwibWVzc2FnZXNSZXNwb25zZSIsIm1lc3NhZ2VzIiwicSIsIm1lc3NhZ2VJZHMiLCJlbWFpbHMiLCJQcm9taXNlIiwiYWxsIiwibWVzc2FnZVJlc3BvbnNlIiwiZ2V0IiwiZm9ybWF0IiwibWV0YWRhdGFIZWFkZXJzIiwibmV4dFBhZ2VUb2tlbiIsInN0YWNrIiwiZmV0Y2hFbWFpbEJ5SWQiLCJtZXNzYWdlSWQiLCJtYXJrQXNSZWFkIiwibW9kaWZ5IiwicmVxdWVzdEJvZHkiLCJyZW1vdmVMYWJlbElkcyIsInRvZ2dsZVN0YXIiLCJzdGFyIiwiYWRkTGFiZWxJZHMiLCJnZXRFbWFpbENvdW50cyIsImxhYmVsc1Jlc3BvbnNlIiwiY291bnRzIiwiaW1wb3J0YW50TGFiZWxzIiwibGFiZWxOYW1lIiwibGFiZWwiLCJsIiwibWVzc2FnZXNVbnJlYWQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./utils/google-gmail.ts\n");

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

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

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

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "http2":
/*!************************!*\
  !*** external "http2" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("http2");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

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

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/lru-cache","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/@auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/googleapis","vendor-chunks/google-auth-library","vendor-chunks/tr46","vendor-chunks/bignumber.js","vendor-chunks/googleapis-common","vendor-chunks/gaxios","vendor-chunks/node-fetch","vendor-chunks/whatwg-url","vendor-chunks/qs","vendor-chunks/json-bigint","vendor-chunks/google-logging-utils","vendor-chunks/object-inspect","vendor-chunks/gcp-metadata","vendor-chunks/debug","vendor-chunks/get-intrinsic","vendor-chunks/https-proxy-agent","vendor-chunks/gtoken","vendor-chunks/agent-base","vendor-chunks/jws","vendor-chunks/jwa","vendor-chunks/url-template","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/webidl-conversions","vendor-chunks/base64-js","vendor-chunks/side-channel-list","vendor-chunks/extend","vendor-chunks/ms","vendor-chunks/supports-color","vendor-chunks/side-channel-weakmap","vendor-chunks/has-symbols","vendor-chunks/function-bind","vendor-chunks/side-channel-map","vendor-chunks/safe-buffer","vendor-chunks/side-channel","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/buffer-equal-constant-time","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/call-bound","vendor-chunks/is-stream","vendor-chunks/es-errors","vendor-chunks/has-flag","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/es-object-atoms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fgmail%2Froute&page=%2Fapi%2Fgmail%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fgmail%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();