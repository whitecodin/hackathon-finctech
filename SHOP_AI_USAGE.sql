
-- Requests-only usage counters. No chat transcripts, prompts or merchant personal information stored.
CREATE TABLE IF NOT EXISTS public.shop_ai_usage (
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 bucket timestamptz NOT NULL,
 uses integer NOT NULL CHECK(uses BETWEEN 1 AND 1000),
 PRIMARY KEY(merchant_id,bucket)
);
ALTER TABLE public.shop_ai_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_ai_usage FROM PUBLIC,anon,authenticated;
CREATE TABLE IF NOT EXISTS public.shop_ai_daily_usage (
 merchant_id bigint NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
 usage_day date NOT NULL,
 uses integer NOT NULL CHECK(uses BETWEEN 1 AND 10000),
 PRIMARY KEY(merchant_id,usage_day)
);
ALTER TABLE public.shop_ai_daily_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shop_ai_daily_usage FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.claim_shop_ai_request(p_merchant_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE minute_uses integer; daily_uses integer;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.merchants m WHERE m.id=p_merchant_id) THEN RETURN false; END IF;
 INSERT INTO public.shop_ai_daily_usage(merchant_id,usage_day,uses)
 VALUES(p_merchant_id,(now() AT TIME ZONE 'Asia/Kolkata')::date,1)
 ON CONFLICT (merchant_id,usage_day) DO UPDATE SET uses=public.shop_ai_daily_usage.uses+1
 WHERE public.shop_ai_daily_usage.uses<60
 RETURNING uses INTO daily_uses;
 IF daily_uses IS NULL THEN RETURN false; END IF;
 INSERT INTO public.shop_ai_usage(merchant_id,bucket,uses)
 VALUES(p_merchant_id,date_trunc('minute',now()),1)
 ON CONFLICT (merchant_id,bucket) DO UPDATE SET uses=public.shop_ai_usage.uses+1
 WHERE public.shop_ai_usage.uses<8
 RETURNING uses INTO minute_uses;
 IF minute_uses IS NULL THEN
  UPDATE public.shop_ai_daily_usage SET uses=uses-1
  WHERE merchant_id=p_merchant_id AND usage_day=(now() AT TIME ZONE 'Asia/Kolkata')::date;
  RETURN false;
 END IF;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.claim_shop_ai_request(bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_shop_ai_request(bigint) TO service_role;
