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
exports.id = "app/api/news/route";
exports.ids = ["app/api/news/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/github */ \"(rsc)/./node_modules/next-auth/providers/github.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n\n// For debugging purposes\nconsole.log(\"NextAuth Config:\", {\n    googleId: process.env.GOOGLE_CLIENT_ID ? \"Set\" : \"Not set\",\n    googleSecret: process.env.GOOGLE_CLIENT_SECRET ? \"Set\" : \"Not set\",\n    nextAuthUrl: process.env.NEXTAUTH_URL,\n    nextAuthSecret: process.env.NEXTAUTH_SECRET ? \"Set\" : \"Not set\"\n});\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"]),\n    providers: [\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_3__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID || \"\",\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET || \"\",\n            authorization: {\n                params: {\n                    scope: \"openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read\",\n                    prompt: \"consent\",\n                    access_type: \"offline\",\n                    response_type: \"code\"\n                }\n            },\n            allowDangerousEmailAccountLinking: true\n        }),\n        (0,next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.GITHUB_ID || \"\",\n            clientSecret: process.env.GITHUB_SECRET || \"\",\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            console.log(\"SignIn callback:\", {\n                user: user ? {\n                    id: user.id,\n                    name: user.name,\n                    email: user.email\n                } : null,\n                account: account ? {\n                    provider: account.provider,\n                    type: account.type\n                } : null,\n                profile: profile ? {\n                    email: profile.email\n                } : null\n            });\n            // Allow sign in regardless of whether the account is already linked\n            return true;\n        },\n        async jwt ({ token, user, account, trigger, session }) {\n            // Initial sign in\n            if (account && user) {\n                console.log(\"JWT callback (initial sign in):\", {\n                    provider: account.provider,\n                    accessToken: account.access_token ? \"Provided\" : \"Missing\",\n                    refreshToken: account.refresh_token ? \"Provided\" : \"Missing\",\n                    expiresAt: account.expires_at\n                });\n                return {\n                    ...token,\n                    accessToken: account.access_token,\n                    refreshToken: account.refresh_token,\n                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,\n                    userRole: \"user\",\n                    userId: user.id\n                };\n            }\n            // Handle updates\n            if (trigger === 'update' && session) {\n                return {\n                    ...token,\n                    ...session\n                };\n            }\n            // Return previous token if the access token has not expired yet\n            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {\n                console.log(\"JWT callback: Using existing token (not expired)\");\n                return token;\n            }\n            console.log(\"JWT callback: Token may be expired or missing expires time\");\n            return token;\n        },\n        async session ({ session, token }) {\n            // This is now always called with a token, not a user\n            if (token) {\n                console.log(\"Session callback with token:\", {\n                    userId: token.userId,\n                    accessToken: token.accessToken ? \"Provided\" : \"Missing\"\n                });\n                // Add the access token and user ID to the session\n                session.accessToken = token.accessToken;\n                session.user.id = token.userId || token.sub;\n                // Fetch user role from database\n                if (session.user.id) {\n                    const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__[\"default\"].user.findUnique({\n                        where: {\n                            id: session.user.id\n                        },\n                        select: {\n                            role: true\n                        }\n                    });\n                    session.user.role = user?.role || 'USER';\n                }\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    debug: \"development\" === \"development\",\n    secret: process.env.NEXTAUTH_SECRET,\n    session: {\n        strategy: \"jwt\",\n        maxAge: 24 * 60 * 60\n    },\n    logger: {\n        error (code, metadata) {\n            console.error(`NextAuth Error: ${code}`, metadata);\n        },\n        warn (code) {\n            console.warn(`NextAuth Warning: ${code}`);\n        },\n        debug (code, metadata) {\n            console.log(`NextAuth Debug: ${code}`, metadata);\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBaUM7QUFDb0I7QUFDRztBQUNBO0FBQ3RCO0FBRWxDLHlCQUF5QjtBQUN6QkssUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtJQUM5QkMsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0IsR0FBRyxRQUFRO0lBQ2pEQyxjQUFjSCxRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixHQUFHLFFBQVE7SUFDekRDLGFBQWFMLFFBQVFDLEdBQUcsQ0FBQ0ssWUFBWTtJQUNyQ0MsZ0JBQWdCUCxRQUFRQyxHQUFHLENBQUNPLGVBQWUsR0FBRyxRQUFRO0FBQ3hEO0FBRU8sTUFBTUMsY0FBYztJQUN6QkMsU0FBU2pCLG1FQUFhQSxDQUFDRyxtREFBTUE7SUFDN0JlLFdBQVc7UUFDVGhCLHNFQUFjQSxDQUFDO1lBQ2JpQixVQUFVWixRQUFRQyxHQUFHLENBQUNDLGdCQUFnQixJQUFJO1lBQzFDVyxjQUFjYixRQUFRQyxHQUFHLENBQUNHLG9CQUFvQixJQUFJO1lBQ2xEVSxlQUFlO2dCQUNiQyxRQUFRO29CQUNOQyxPQUFPO29CQUNQQyxRQUFRO29CQUNSQyxhQUFhO29CQUNiQyxlQUFlO2dCQUNqQjtZQUNGO1lBQ0FDLG1DQUFtQztRQUNyQztRQUNBMUIsc0VBQWNBLENBQUM7WUFDYmtCLFVBQVVaLFFBQVFDLEdBQUcsQ0FBQ29CLFNBQVMsSUFBSTtZQUNuQ1IsY0FBY2IsUUFBUUMsR0FBRyxDQUFDcUIsYUFBYSxJQUFJO1lBQzNDRixtQ0FBbUM7UUFDckM7S0FDRDtJQUNERyxXQUFXO1FBQ1QsTUFBTUMsUUFBTyxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFO1lBQ3JDOUIsUUFBUUMsR0FBRyxDQUFDLG9CQUFvQjtnQkFDOUIyQixNQUFNQSxPQUFPO29CQUFFRyxJQUFJSCxLQUFLRyxFQUFFO29CQUFFQyxNQUFNSixLQUFLSSxJQUFJ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RUFBRUYsTUFBTTtRQUMxQztRQUNBTCxPQUFNSyxJQUFJLEVBQUVDLFFBQVE7WUFDbEJqRSxRQUFRQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRStELE1BQU0sRUFBRUM7UUFDekM7SUFDRjtBQUNGLEVBQUU7QUFFRixNQUFNRSxVQUFVeEUsZ0RBQVFBLENBQUNpQjtBQUVrQiIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgeyBQcmlzbWFBZGFwdGVyIH0gZnJvbSBcIkBhdXRoL3ByaXNtYS1hZGFwdGVyXCI7XG5pbXBvcnQgR2l0aHViUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ2l0aHViXCI7XG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlXCI7XG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcblxuLy8gRm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xuY29uc29sZS5sb2coXCJOZXh0QXV0aCBDb25maWc6XCIsIHtcbiAgZ29vZ2xlSWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIGdvb2dsZVNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG4gIG5leHRBdXRoVXJsOiBwcm9jZXNzLmVudi5ORVhUQVVUSF9VUkwsXG4gIG5leHRBdXRoU2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQgPyBcIlNldFwiIDogXCJOb3Qgc2V0XCIsXG59KTtcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zID0ge1xuICBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIEdvb2dsZVByb3ZpZGVyKHtcbiAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEIHx8IFwiXCIsXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhdXRob3JpemF0aW9uOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHNjb3BlOiBcIm9wZW5pZCBlbWFpbCBwcm9maWxlIGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvY2FsZW5kYXIgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9jYWxlbmRhci5ldmVudHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5yZWFkb25seSBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLm1ldGFkYXRhLnJlYWRvbmx5IGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHkgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5sYWJlbHMgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmFjdGl2aXR5LnJlYWQgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9maXRuZXNzLmJvZHkucmVhZFwiLFxuICAgICAgICAgIHByb21wdDogXCJjb25zZW50XCIsXG4gICAgICAgICAgYWNjZXNzX3R5cGU6IFwib2ZmbGluZVwiLFxuICAgICAgICAgIHJlc3BvbnNlX3R5cGU6IFwiY29kZVwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gICAgR2l0aHViUHJvdmlkZXIoe1xuICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdJVEhVQl9JRCB8fCBcIlwiLFxuICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HSVRIVUJfU0VDUkVUIHx8IFwiXCIsXG4gICAgICBhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmc6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUgfSkge1xuICAgICAgY29uc29sZS5sb2coXCJTaWduSW4gY2FsbGJhY2s6XCIsIHsgXG4gICAgICAgIHVzZXI6IHVzZXIgPyB7IGlkOiB1c2VyLmlkLCBuYW1lOiB1c2VyLm5hbWUsIGVtYWlsOiB1c2VyLmVtYWlsIH0gOiBudWxsLFxuICAgICAgICBhY2NvdW50OiBhY2NvdW50ID8geyBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlciwgdHlwZTogYWNjb3VudC50eXBlIH0gOiBudWxsLFxuICAgICAgICBwcm9maWxlOiBwcm9maWxlID8geyBlbWFpbDogcHJvZmlsZS5lbWFpbCB9IDogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBBbGxvdyBzaWduIGluIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgYWNjb3VudCBpcyBhbHJlYWR5IGxpbmtlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciwgYWNjb3VudCwgdHJpZ2dlciwgc2Vzc2lvbiB9KSB7XG4gICAgICAvLyBJbml0aWFsIHNpZ24gaW5cbiAgICAgIGlmIChhY2NvdW50ICYmIHVzZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2sgKGluaXRpYWwgc2lnbiBpbik6XCIsIHtcbiAgICAgICAgICBwcm92aWRlcjogYWNjb3VudC5wcm92aWRlcixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4gPyBcIlByb3ZpZGVkXCIgOiBcIk1pc3NpbmdcIixcbiAgICAgICAgICByZWZyZXNoVG9rZW46IGFjY291bnQucmVmcmVzaF90b2tlbiA/IFwiUHJvdmlkZWRcIiA6IFwiTWlzc2luZ1wiLFxuICAgICAgICAgIGV4cGlyZXNBdDogYWNjb3VudC5leHBpcmVzX2F0LFxuICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi50b2tlbixcbiAgICAgICAgICBhY2Nlc3NUb2tlbjogYWNjb3VudC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgcmVmcmVzaFRva2VuOiBhY2NvdW50LnJlZnJlc2hfdG9rZW4sXG4gICAgICAgICAgYWNjZXNzVG9rZW5FeHBpcmVzOiBhY2NvdW50LmV4cGlyZXNfYXQgPyBhY2NvdW50LmV4cGlyZXNfYXQgKiAxMDAwIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHVzZXJSb2xlOiBcInVzZXJcIixcbiAgICAgICAgICB1c2VySWQ6IHVzZXIuaWQsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSB1cGRhdGVzXG4gICAgICBpZiAodHJpZ2dlciA9PT0gJ3VwZGF0ZScgJiYgc2Vzc2lvbikge1xuICAgICAgICByZXR1cm4geyAuLi50b2tlbiwgLi4uc2Vzc2lvbiB9O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gcHJldmlvdXMgdG9rZW4gaWYgdGhlIGFjY2VzcyB0b2tlbiBoYXMgbm90IGV4cGlyZWQgeWV0XG4gICAgICBpZiAodG9rZW4uYWNjZXNzVG9rZW5FeHBpcmVzICYmIERhdGUubm93KCkgPCB0b2tlbi5hY2Nlc3NUb2tlbkV4cGlyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFVzaW5nIGV4aXN0aW5nIHRva2VuIChub3QgZXhwaXJlZClcIik7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJKV1QgY2FsbGJhY2s6IFRva2VuIG1heSBiZSBleHBpcmVkIG9yIG1pc3NpbmcgZXhwaXJlcyB0aW1lXCIpO1xuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIC8vIFRoaXMgaXMgbm93IGFsd2F5cyBjYWxsZWQgd2l0aCBhIHRva2VuLCBub3QgYSB1c2VyXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXNzaW9uIGNhbGxiYWNrIHdpdGggdG9rZW46XCIsIHsgXG4gICAgICAgICAgdXNlcklkOiB0b2tlbi51c2VySWQsXG4gICAgICAgICAgYWNjZXNzVG9rZW46IHRva2VuLmFjY2Vzc1Rva2VuID8gXCJQcm92aWRlZFwiIDogXCJNaXNzaW5nXCIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgYWNjZXNzIHRva2VuIGFuZCB1c2VyIElEIHRvIHRoZSBzZXNzaW9uXG4gICAgICAgIHNlc3Npb24uYWNjZXNzVG9rZW4gPSB0b2tlbi5hY2Nlc3NUb2tlbjtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4udXNlcklkIHx8IHRva2VuLnN1YjtcbiAgICAgICAgXG4gICAgICAgIC8vIEZldGNoIHVzZXIgcm9sZSBmcm9tIGRhdGFiYXNlXG4gICAgICAgIGlmIChzZXNzaW9uLnVzZXIuaWQpIHtcbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBpZDogc2Vzc2lvbi51c2VyLmlkIH0sXG4gICAgICAgICAgICBzZWxlY3Q6IHsgcm9sZTogdHJ1ZSB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB1c2VyPy5yb2xlIHx8ICdVU0VSJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogXCIvbG9naW5cIixcbiAgICBlcnJvcjogXCIvbG9naW5cIiwgLy8gRXJyb3IgcGFnZVxuICB9LFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIixcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogXCJqd3RcIiwgLy8gSW1wb3J0YW50OiB1c2UgSldUIHN0cmF0ZWd5IHRvIG1ha2UgdGhlIHRva2VuIGF2YWlsYWJsZVxuICAgIG1heEFnZTogMjQgKiA2MCAqIDYwLCAvLyAyNCBob3Vyc1xuICB9LFxuICBsb2dnZXI6IHtcbiAgICBlcnJvcihjb2RlLCBtZXRhZGF0YSkge1xuICAgICAgY29uc29sZS5lcnJvcihgTmV4dEF1dGggRXJyb3I6ICR7Y29kZX1gLCBtZXRhZGF0YSk7XG4gICAgfSxcbiAgICB3YXJuKGNvZGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgTmV4dEF1dGggV2FybmluZzogJHtjb2RlfWApO1xuICAgIH0sXG4gICAgZGVidWcoY29kZSwgbWV0YWRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBOZXh0QXV0aCBEZWJ1ZzogJHtjb2RlfWAsIG1ldGFkYXRhKTtcbiAgICB9LFxuICB9LFxufTtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9OyJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIlByaXNtYUFkYXB0ZXIiLCJHaXRodWJQcm92aWRlciIsIkdvb2dsZVByb3ZpZGVyIiwicHJpc21hIiwiY29uc29sZSIsImxvZyIsImdvb2dsZUlkIiwicHJvY2VzcyIsImVudiIsIkdPT0dMRV9DTElFTlRfSUQiLCJnb29nbGVTZWNyZXQiLCJHT09HTEVfQ0xJRU5UX1NFQ1JFVCIsIm5leHRBdXRoVXJsIiwiTkVYVEFVVEhfVVJMIiwibmV4dEF1dGhTZWNyZXQiLCJORVhUQVVUSF9TRUNSRVQiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsImF1dGhvcml6YXRpb24iLCJwYXJhbXMiLCJzY29wZSIsInByb21wdCIsImFjY2Vzc190eXBlIiwicmVzcG9uc2VfdHlwZSIsImFsbG93RGFuZ2Vyb3VzRW1haWxBY2NvdW50TGlua2luZyIsIkdJVEhVQl9JRCIsIkdJVEhVQl9TRUNSRVQiLCJjYWxsYmFja3MiLCJzaWduSW4iLCJ1c2VyIiwiYWNjb3VudCIsInByb2ZpbGUiLCJpZCIsIm5hbWUiLCJlbWFpbCIsInByb3ZpZGVyIiwidHlwZSIsImp3dCIsInRva2VuIiwidHJpZ2dlciIsInNlc3Npb24iLCJhY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsInJlZnJlc2hUb2tlbiIsInJlZnJlc2hfdG9rZW4iLCJleHBpcmVzQXQiLCJleHBpcmVzX2F0IiwiYWNjZXNzVG9rZW5FeHBpcmVzIiwidW5kZWZpbmVkIiwidXNlclJvbGUiLCJ1c2VySWQiLCJEYXRlIiwibm93Iiwic3ViIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwic2VsZWN0Iiwicm9sZSIsInBhZ2VzIiwiZXJyb3IiLCJkZWJ1ZyIsInNlY3JldCIsInN0cmF0ZWd5IiwibWF4QWdlIiwibG9nZ2VyIiwiY29kZSIsIm1ldGFkYXRhIiwid2FybiIsImhhbmRsZXIiLCJHRVQiLCJQT1NUIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/news/route.ts":
/*!*******************************!*\
  !*** ./app/api/news/route.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/app/api/auth/[...nextauth]/route */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n// NewsAPI.org - Free tier: 100 requests per day\nconst NEWS_API_KEY = process.env.NEWS_API_KEY || '';\nconst NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';\nasync function GET(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_app_api_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Unauthorized'\n            }, {\n                status: 401\n            });\n        }\n        const searchParams = request.nextUrl.searchParams;\n        const category = searchParams.get('category') || 'general';\n        const country = searchParams.get('country') || 'us' // Default to US for more content\n        ;\n        if (!NEWS_API_KEY) {\n            console.warn('NEWS_API_KEY not found. Please get a free API key from https://newsapi.org');\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                articles: [],\n                message: 'News API key not configured. Get a free key at https://newsapi.org'\n            });\n        }\n        console.log('Fetching news with API key:', NEWS_API_KEY.substring(0, 8) + '...');\n        // Fetch real news from NewsAPI\n        const url = new URL(NEWS_API_URL);\n        url.searchParams.append('country', country);\n        url.searchParams.append('category', category);\n        url.searchParams.append('pageSize', '10');\n        url.searchParams.append('apiKey', NEWS_API_KEY);\n        const response = await fetch(url.toString(), {\n            headers: {\n                'Accept': 'application/json'\n            },\n            next: {\n                revalidate: 300\n            } // Cache for 5 minutes\n        });\n        if (!response.ok) {\n            const errorData = await response.json();\n            console.error('News API error:', errorData);\n            throw new Error(`News API responded with status: ${response.status} - ${errorData.message || 'Unknown error'}`);\n        }\n        const data = await response.json();\n        console.log('News API response:', {\n            status: data.status,\n            totalResults: data.totalResults,\n            articlesCount: data.articles?.length || 0\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            articles: data.articles || []\n        });\n    } catch (error) {\n        console.error('Error fetching news:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to fetch news'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL25ld3Mvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBdUQ7QUFDWDtBQUNvQjtBQUVoRSxnREFBZ0Q7QUFDaEQsTUFBTUcsZUFBZUMsUUFBUUMsR0FBRyxDQUFDRixZQUFZLElBQUk7QUFDakQsTUFBTUcsZUFBZTtBQUVkLGVBQWVDLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRixNQUFNQyxVQUFVLE1BQU1SLDJEQUFnQkEsQ0FBQ0MscUVBQVdBO1FBQ2xELElBQUksQ0FBQ08sU0FBUztZQUNaLE9BQU9ULHFEQUFZQSxDQUFDVSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBZSxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDcEU7UUFFQSxNQUFNQyxlQUFlTCxRQUFRTSxPQUFPLENBQUNELFlBQVk7UUFDakQsTUFBTUUsV0FBV0YsYUFBYUcsR0FBRyxDQUFDLGVBQWU7UUFDakQsTUFBTUMsVUFBVUosYUFBYUcsR0FBRyxDQUFDLGNBQWMsS0FBSyxpQ0FBaUM7O1FBRXJGLElBQUksQ0FBQ2IsY0FBYztZQUNqQmUsUUFBUUMsSUFBSSxDQUFDO1lBQ2IsT0FBT25CLHFEQUFZQSxDQUFDVSxJQUFJLENBQUM7Z0JBQ3ZCVSxVQUFVLEVBQUU7Z0JBQ1pDLFNBQVM7WUFDWDtRQUNGO1FBRUFILFFBQVFJLEdBQUcsQ0FBQywrQkFBK0JuQixhQUFhb0IsU0FBUyxDQUFDLEdBQUcsS0FBSztRQUUxRSwrQkFBK0I7UUFDL0IsTUFBTUMsTUFBTSxJQUFJQyxJQUFJbkI7UUFDcEJrQixJQUFJWCxZQUFZLENBQUNhLE1BQU0sQ0FBQyxXQUFXVDtRQUNuQ08sSUFBSVgsWUFBWSxDQUFDYSxNQUFNLENBQUMsWUFBWVg7UUFDcENTLElBQUlYLFlBQVksQ0FBQ2EsTUFBTSxDQUFDLFlBQVk7UUFDcENGLElBQUlYLFlBQVksQ0FBQ2EsTUFBTSxDQUFDLFVBQVV2QjtRQUVsQyxNQUFNd0IsV0FBVyxNQUFNQyxNQUFNSixJQUFJSyxRQUFRLElBQUk7WUFDM0NDLFNBQVM7Z0JBQ1AsVUFBVTtZQUNaO1lBQ0FDLE1BQU07Z0JBQUVDLFlBQVk7WUFBSSxFQUFFLHNCQUFzQjtRQUNsRDtRQUVBLElBQUksQ0FBQ0wsU0FBU00sRUFBRSxFQUFFO1lBQ2hCLE1BQU1DLFlBQVksTUFBTVAsU0FBU2pCLElBQUk7WUFDckNRLFFBQVFQLEtBQUssQ0FBQyxtQkFBbUJ1QjtZQUNqQyxNQUFNLElBQUlDLE1BQU0sQ0FBQyxnQ0FBZ0MsRUFBRVIsU0FBU2YsTUFBTSxDQUFDLEdBQUcsRUFBRXNCLFVBQVViLE9BQU8sSUFBSSxpQkFBaUI7UUFDaEg7UUFFQSxNQUFNZSxPQUFPLE1BQU1ULFNBQVNqQixJQUFJO1FBRWhDUSxRQUFRSSxHQUFHLENBQUMsc0JBQXNCO1lBQ2hDVixRQUFRd0IsS0FBS3hCLE1BQU07WUFDbkJ5QixjQUFjRCxLQUFLQyxZQUFZO1lBQy9CQyxlQUFlRixLQUFLaEIsUUFBUSxFQUFFbUIsVUFBVTtRQUMxQztRQUVBLE9BQU92QyxxREFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQ3ZCVSxVQUFVZ0IsS0FBS2hCLFFBQVEsSUFBSSxFQUFFO1FBQy9CO0lBQ0YsRUFBRSxPQUFPVCxPQUFPO1FBQ2RPLFFBQVFQLEtBQUssQ0FBQyx3QkFBd0JBO1FBQ3RDLE9BQU9YLHFEQUFZQSxDQUFDVSxJQUFJLENBQ3RCO1lBQUVDLE9BQU87UUFBdUIsR0FDaEM7WUFBRUMsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy95dXN0aW50cm9vc3QvRG9jdW1lbnRzL3NpdGVzL3l1c3Rib2FyZC9hcHAvYXBpL25ld3Mvcm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gJ25leHQtYXV0aCdcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZSdcblxuLy8gTmV3c0FQSS5vcmcgLSBGcmVlIHRpZXI6IDEwMCByZXF1ZXN0cyBwZXIgZGF5XG5jb25zdCBORVdTX0FQSV9LRVkgPSBwcm9jZXNzLmVudi5ORVdTX0FQSV9LRVkgfHwgJydcbmNvbnN0IE5FV1NfQVBJX1VSTCA9ICdodHRwczovL25ld3NhcGkub3JnL3YyL3RvcC1oZWFkbGluZXMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucylcbiAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pXG4gICAgfVxuXG4gICAgY29uc3Qgc2VhcmNoUGFyYW1zID0gcmVxdWVzdC5uZXh0VXJsLnNlYXJjaFBhcmFtc1xuICAgIGNvbnN0IGNhdGVnb3J5ID0gc2VhcmNoUGFyYW1zLmdldCgnY2F0ZWdvcnknKSB8fCAnZ2VuZXJhbCdcbiAgICBjb25zdCBjb3VudHJ5ID0gc2VhcmNoUGFyYW1zLmdldCgnY291bnRyeScpIHx8ICd1cycgLy8gRGVmYXVsdCB0byBVUyBmb3IgbW9yZSBjb250ZW50XG4gICAgXG4gICAgaWYgKCFORVdTX0FQSV9LRVkpIHtcbiAgICAgIGNvbnNvbGUud2FybignTkVXU19BUElfS0VZIG5vdCBmb3VuZC4gUGxlYXNlIGdldCBhIGZyZWUgQVBJIGtleSBmcm9tIGh0dHBzOi8vbmV3c2FwaS5vcmcnKVxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgICAgYXJ0aWNsZXM6IFtdLFxuICAgICAgICBtZXNzYWdlOiAnTmV3cyBBUEkga2V5IG5vdCBjb25maWd1cmVkLiBHZXQgYSBmcmVlIGtleSBhdCBodHRwczovL25ld3NhcGkub3JnJ1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnRmV0Y2hpbmcgbmV3cyB3aXRoIEFQSSBrZXk6JywgTkVXU19BUElfS0VZLnN1YnN0cmluZygwLCA4KSArICcuLi4nKVxuXG4gICAgLy8gRmV0Y2ggcmVhbCBuZXdzIGZyb20gTmV3c0FQSVxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoTkVXU19BUElfVVJMKVxuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdjb3VudHJ5JywgY291bnRyeSlcbiAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnY2F0ZWdvcnknLCBjYXRlZ29yeSlcbiAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgncGFnZVNpemUnLCAnMTAnKVxuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdhcGlLZXknLCBORVdTX0FQSV9LRVkpXG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybC50b1N0cmluZygpLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgICAgbmV4dDogeyByZXZhbGlkYXRlOiAzMDAgfSAvLyBDYWNoZSBmb3IgNSBtaW51dGVzXG4gICAgfSlcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgY29uc29sZS5lcnJvcignTmV3cyBBUEkgZXJyb3I6JywgZXJyb3JEYXRhKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOZXdzIEFQSSByZXNwb25kZWQgd2l0aCBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfSAtICR7ZXJyb3JEYXRhLm1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InfWApXG4gICAgfVxuXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIFxuICAgIGNvbnNvbGUubG9nKCdOZXdzIEFQSSByZXNwb25zZTonLCB7XG4gICAgICBzdGF0dXM6IGRhdGEuc3RhdHVzLFxuICAgICAgdG90YWxSZXN1bHRzOiBkYXRhLnRvdGFsUmVzdWx0cyxcbiAgICAgIGFydGljbGVzQ291bnQ6IGRhdGEuYXJ0aWNsZXM/Lmxlbmd0aCB8fCAwXG4gICAgfSlcbiAgICBcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgYXJ0aWNsZXM6IGRhdGEuYXJ0aWNsZXMgfHwgW11cbiAgICB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIG5ld3M6JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBuZXdzJyB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKVxuICB9XG59Il0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsIk5FV1NfQVBJX0tFWSIsInByb2Nlc3MiLCJlbnYiLCJORVdTX0FQSV9VUkwiLCJHRVQiLCJyZXF1ZXN0Iiwic2Vzc2lvbiIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInNlYXJjaFBhcmFtcyIsIm5leHRVcmwiLCJjYXRlZ29yeSIsImdldCIsImNvdW50cnkiLCJjb25zb2xlIiwid2FybiIsImFydGljbGVzIiwibWVzc2FnZSIsImxvZyIsInN1YnN0cmluZyIsInVybCIsIlVSTCIsImFwcGVuZCIsInJlc3BvbnNlIiwiZmV0Y2giLCJ0b1N0cmluZyIsImhlYWRlcnMiLCJuZXh0IiwicmV2YWxpZGF0ZSIsIm9rIiwiZXJyb3JEYXRhIiwiRXJyb3IiLCJkYXRhIiwidG90YWxSZXN1bHRzIiwiYXJ0aWNsZXNDb3VudCIsImxlbmd0aCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/news/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) {\n    global.prisma = prisma;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBOEM7QUFZdkMsTUFBTUMsU0FBU0MsT0FBT0QsTUFBTSxJQUFJLElBQUlELHdEQUFZQSxHQUFHO0FBRTFELElBQUlHLElBQXFDLEVBQUU7SUFDekNELE9BQU9ELE1BQU0sR0FBR0E7QUFDbEI7QUFFQSxpRUFBZUEsTUFBTUEsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2xpYi9wcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuXG4vLyBQcmlzbWFDbGllbnQgaXMgYXR0YWNoZWQgdG8gdGhlIGBnbG9iYWxgIG9iamVjdCBpbiBkZXZlbG9wbWVudCB0byBwcmV2ZW50XG4vLyBleGhhdXN0aW5nIHlvdXIgZGF0YWJhc2UgY29ubmVjdGlvbiBsaW1pdC5cbi8vXG4vLyBMZWFybiBtb3JlOiBcbi8vIGh0dHBzOi8vcHJpcy5seS9kL2hlbHAvbmV4dC1qcy1iZXN0LXByYWN0aWNlc1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHZhciBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbC5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBnbG9iYWwucHJpc21hID0gcHJpc21hO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7Il0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsInByaXNtYSIsImdsb2JhbCIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Froute&page=%2Fapi%2Fnews%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Froute&page=%2Fapi%2Fnews%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yustintroost_Documents_sites_yustboard_app_api_news_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/news/route.ts */ \"(rsc)/./app/api/news/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/news/route\",\n        pathname: \"/api/news\",\n        filename: \"route\",\n        bundlePath: \"app/api/news/route\"\n    },\n    resolvedPagePath: \"/Users/yustintroost/Documents/sites/yustboard/app/api/news/route.ts\",\n    nextConfigOutput,\n    userland: _Users_yustintroost_Documents_sites_yustboard_app_api_news_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZuZXdzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZuZXdzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGbmV3cyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnl1c3RpbnRyb29zdCUyRkRvY3VtZW50cyUyRnNpdGVzJTJGeXVzdGJvYXJkJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNtQjtBQUNoRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3l1c3RpbnRyb29zdC9Eb2N1bWVudHMvc2l0ZXMveXVzdGJvYXJkL2FwcC9hcGkvbmV3cy9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbmV3cy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL25ld3NcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL25ld3Mvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMveXVzdGludHJvb3N0L0RvY3VtZW50cy9zaXRlcy95dXN0Ym9hcmQvYXBwL2FwaS9uZXdzL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Froute&page=%2Fapi%2Fnews%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/lru-cache","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/@auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fnews%2Froute&page=%2Fapi%2Fnews%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnews%2Froute.ts&appDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyustintroost%2FDocuments%2Fsites%2Fyustboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();