import React, { FormEvent, useContext, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Link,
  Paper,
  Stack,
  styled,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import getTheme from "../theme/themeCustomizations";
import { createTheme } from "@mui/material/styles";
import { FacebookIcon, GoogleIcon, McllIcon } from "../icons/companyIcons";
import ReCAPTCHA from "react-google-recaptcha";
import { z } from "zod";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../composables/auth/AuthContext";
import { setGroup, setUserId } from "../store/userSlice";
import { User } from "../types/user";
import { useDispatch } from "react-redux";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "100%",
  padding: 20,
  backgroundImage:
    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
}));

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [open, setOpen] = React.useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const dispatch = useDispatch();

  const onRecaptchaChange = (value: string | null) => {
    console.log("reCAPTCHA value:", value);
    setRecaptchaValue(value);
  };

  const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

  const validate = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({ email: "", password: "" });
      return true;
    } catch (err: any) {
      const zodErrors = err.errors.reduce(
        (
          acc: { [x: string]: any },
          error: { path: (string | number)[]; message: any },
        ) => {
          acc[error.path[0]] = error.message;
          return acc;
        },
        {},
      );
      setErrors(zodErrors);
      return false;
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/login`;
        const response = await axios.post(
          url,
          {
            username: email,
            password: password,
          },
          {
            headers: {
              "Content-type": "application/json",
            },
          },
        );

        if (response.status === 200) {
          const authHeader = response.headers["authorization"];

          const user: User = response.data.user;
          if (authHeader) {
            const jwtToken = authHeader.split(" ")[1];
            setToken(jwtToken);
            login(jwtToken);
            dispatch(setUserId(user.user_id));
            dispatch(setGroup(user.group));
            setLoginError("");
            navigate("/dashboard");
          }
        } else {
          setLoginError(response.statusText);
        }
      } catch (err: any) {
        if (err.status === 401) {
          setLoginError("Incorrect email or password");
        } else {
          if (err && err.response && err.response.data) {
            setLoginError(err.response.data.error);
          } else {
            setLoginError(err.message);
          }
        }
      }
    }
  };

  const customTheme = createTheme(getTheme());

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{ height: "100vh", justifyContent: "center", alignItems: "center" }}
    >
      <Grid
        sx={{
          xs: "100%",
          sm: "75%",
          md: "50%",
          lg: "33%",
        }}
      >
        <ThemeProvider theme={customTheme}>
          <CssBaseline enableColorScheme />
          <SignInContainer direction="column" sx= {{justifyContent: "space-between" }}>
            <Card elevation={3}>
              <McllIcon />
              <Typography
                component="h1"
                variant="h4"
                sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
              >
                Sign in
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  gap: 2,
                }}
              >
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={errors.email ? "error" : "primary"}
                    sx={{ ariaLabel: "email" }}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email || ""}
                  />
                </FormControl>
                <FormControl>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Link
                      component="button"
                      onClick={handleClickOpen}
                      variant="body2"
                      sx={{ alignSelf: "baseline" }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                  <TextField
                    error={!!errors.password}
                    helperText={errors.password || ""}
                    name="password"
                    placeholder="••••••"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={errors.password ? "error" : "primary"}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>

                <div style={{ display: "flex", justifyContent: "left" }}>
                  <ReCAPTCHA
                    sitekey="6LcdRA4UAAAAAFM3ccqJ7yvcqh3PTAPFPI1_Jevt" // Replace with your site key
                    onChange={onRecaptchaChange}
                  />
                </div>

                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                {/*<ForgotPassword open={open} handleClose={handleClose} />*/}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  onClick={(event) => handleLogin(event)}
                >
                  Sign in
                </Button>
                {loginError && (
                  <Alert variant="outlined" severity="error">
                    {loginError}
                  </Alert>
                )}
                <Typography sx={{ textAlign: "center" }}>
                  Don&apos;t have an account?{" "}
                  <span>
                    <Link
                      href="/material-ui/getting-started/templates/sign-in/"
                      variant="body2"
                      sx={{ alignSelf: "center" }}
                    >
                      Sign up
                    </Link>
                  </span>
                </Typography>
              </Box>
              <Divider>or</Divider>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="outlined"
                  onClick={() => alert("Sign in with Google")}
                  startIcon={<GoogleIcon />}
                >
                  Sign in with Google
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  variant="outlined"
                  onClick={() => alert("Sign in with Facebook")}
                  startIcon={<FacebookIcon />}
                >
                  Sign in with Facebook
                </Button>
              </Box>
            </Card>
          </SignInContainer>
        </ThemeProvider>
      </Grid>
    </Grid>
  );
};

export default Login;
