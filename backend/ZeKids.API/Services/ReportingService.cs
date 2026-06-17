namespace ZeKids.API.Services;

public class ReportingService
{
    public double CalculateMRT(List<double> reactionTimes)
    {
        if (reactionTimes == null || reactionTimes.Count == 0)
            return 0;

        return reactionTimes.Average();
    }

    public double CalculateRTV(List<double> reactionTimes)
    {
        if (reactionTimes == null || reactionTimes.Count < 2)
            return 0;

        var mean = reactionTimes.Average();
        var sumOfSquares = reactionTimes.Sum(rt => Math.Pow(rt - mean, 2));
        return Math.Sqrt(sumOfSquares / reactionTimes.Count);
    }

    public (int omissionErrors, int commissionErrors) ClassifyErrors(dynamic rawData)
    {
        // Bu ANT test verilerine göre hesaplanacak
        // Omission: Hedef uyarana tepki vermeme
        // Commission: Yanlış uyarana tepki verme
        
        int omissionErrors = 0;
        int commissionErrors = 0;

        // rawData içinden trial verilerini parse et
        // Bu örnekte basit bir yaklaşım
        
        return (omissionErrors, commissionErrors);
    }

    public string GetInterpretation(double rtv)
    {
        if (rtv < 50) return "Mükemmel! Dikkat tutarlılığı çok yüksek.";
        if (rtv < 80) return "İyi! Dikkat sürdürülebilirliği gelişiyor.";
        if (rtv < 120) return "Orta seviye. Düzenli pratikle iyileşebilir.";
        return "Daha fazla pratik önerilir.";
    }
}
