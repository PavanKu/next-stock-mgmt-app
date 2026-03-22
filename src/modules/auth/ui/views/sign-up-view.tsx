"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, { message: "Username is required"}),
  email: z.email(),
  password: z.string().min(1, { message: "Password is required" }),
	confirmPassword: z.string().min(1, { message: "Password is required"})
})
.refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"]
});

export function SignUpView() {
  const router = useRouter();
	const [error, setError] = useState<null|string>(null)
	const [pending, setPending] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
			name: "",
      email: "",
      password: "",
			confirmPassword: ""
    },
  });

	const handleSocialBtnClick = async (provider: "google"|"github") => {
		setError(null);
		setPending(true);
		const {data, error:err} = await authClient.signIn.social({
			provider,
			callbackURL: "/"
		});

		setPending(false);
		if(err) {
			setError(err.message ?? "Oops! Something went wrong.");
		}
	}

	const handleSubmit = async ({email, password, name}: z.infer<typeof formSchema>) => {
		setError(null);
		setPending(true);
		const {error:err, data} = await authClient.signUp.email({
			name,
			email,
			password,
			callbackURL: "/"
		})
		setPending(false);
		if(err) {
			setError(err.message ?? "Oops! Something went wrong.");
		} else {
      router.push("/")
    }
	}

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid md:grid-cols-2 p-0">
          <Form {...form}>
            <form className="p-6 md:p-8" onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col justify-center items-center">
                  <h1 className="font-bold text-2xl">Let&apos;s get started</h1>
                  <p className="text-muted-foreground text-balance">Create your account</p>
                </div>
								<div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>
												<FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@email.com"
                            {...field}
                          />
                        </FormControl>
												<FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
								<div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="*******"
                            {...field}
                          />
                        </FormControl>
												<FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
								<div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="*******"
                            {...field}
                          />
                        </FormControl>
												<FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
								{!!error && (
									<Alert className="bg-destructive/10 border-none">
										<OctagonAlertIcon className="h-4 w-4 !text-destructive"/>
										<AlertTitle>{error}</AlertTitle>
									</Alert>
								)}
								<Button className="w-full" type="submit" disabled={pending}>Sign in</Button>
								<div className="relative text-center text-sm after:border-border after:inset-0 after:top-1/2 after:flex after:items-center after:absolute after:border-t after:z-0">
									<span className="text-muted-foreground z-10 bg-card relative px-2">Or continue with</span>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<Button
										variant="outline"
										type="button"
										className="w-full"
										disabled={pending}
										onClick={() => handleSocialBtnClick("google")}
									>
										Google
									</Button>
									<Button
										variant="outline"
										type="button"
										className="w-full"
										disabled={pending}
										onClick={() => handleSocialBtnClick("github")}
									>
										Github
									</Button>
								</div>
								<div className="text-center text-sm">
									Already have an account?{" "}
									<Link href="/sign-in" className="underline underline-offset-4">Sign in</Link>
								</div>
              </div>
            </form>
          </Form>
          <div className="bg-radial from-blue-200 to-blue-400 hidden md:flex justify-center items-center flex-col">
            <Image src="/logo.svg" width={92} height={92} alt="logo" />
            <p className="text-2xl font-semibold text-white">Meet.AI</p>
          </div>
        </CardContent>
      </Card>
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
			</div>
    </div>
  );
}
