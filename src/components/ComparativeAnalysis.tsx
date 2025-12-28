import { useState, useMemo } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
  ChartLine, 
  TrendDown, 
  Target, 
  Downloa
  Calendar,
} from '@ph
  LineChart, 
  BarChart, 
  XAxis, 
  Cartesi
  Legend, 
  ComposedCha
  AreaChart
  RadarCha
  PolarAngleAxis,
  Radar
import { moti
import {
import { toa
interfa
  onOpenC
  alerts:
}
interface Q
  portfoli
    averageRisk: numbe
    esgScore: nu
  }
    efficien
    acc
    avgTasksP
  riskMetric
    defaultProbab
    avgRecoveryRat
  marke
    averageBidAsk
    marketParticipation: number
}
export function ComparativeAnalysis({ ope

    const currentExposure = lo

          const compliant = l.covena
        }, 0) /

    const currentESG = loan
      : 4
    const highR
 

      sum + l.covenants.f

    const avgResponse
        .reduce((sum, a) 
          return sum + 
      : 42
    const q2Data: Qu
      portfolioMetric
   
        esgScore
      },
        efficiency: 76,
        accuracy: 89
        avgTasksPerMember:
      riskMetrics: {
   
        avgRecov
      marketMetrics: {
        averageBidAsk: 3.1,
        marketParticipation:
    }
   
      portfolioMet
        averageRisk: curr
        esgScore: Math.mi
      },
        efficiency: 89,
   
 

        defaultProbability: avgDefaultProb * 100 * 0.85,
        avgRecoveryRate: 82,

        averageBidAsk: 1.8,
        marketParticipation: 65,
    }
    return { q2: q2Data, q3: q3Data }

    const categories = [
        name: 'Portfolio',
          {
           

          },
            name: 'Average Risk',
            q3: quarterlyData.q3.portfolioMetrics.averageRisk,
         

            q2: quarterlyData.q2.portfolioMetrics.covenantCompliance,
            format: 'percent',
          },
         

            higher: 'good'
          {
     

          },
      },
        name: 'Team Performance',
          {
            q2: quarterlyData.q2.teamMetrics.efficiency,
            format: 'number',
          },
          

            higher: 'bad'
          {
            q2: quarterly
            format: 'percent',
          },
            name: 'Alerts Resolved',
            q3: quarterlyData.q3.teamMetrics.alert
            higher: 'good'
        
      {
        metrics: [
            name: 'High Risk Loans',
            q3: quart
            higher: 'bad'
          {
        
            format: 
          },
            name: 'Covenant Breaches',
            q3: quarterlyData.q3.riskMetrics.covenantBreaches
            higher: 'bad'
        
            q2: quarte
            format: 'percent',
          },
      },
        name: 'Market Intelligen
        
     

          },
            name: 'Bid-As
            q3: quarterly
            higher: 'bad'
          {
            q2: quarterlyData.q2.marketMetrics.liquidityIndex,
            format: 'number',
          },
        
            q3: quar
            higher: 'go
        ]
    ]
    return categories

    retu
        month: 'Apr'
        risk: quarterlyData.q2.portfolioMetrics.averageRisk * 1.03,
        compliance: quarterlyData.q2.portfolioMetrics.co
      {
        exposure: quarterlyD
        
      },
        month: 'Jun',
        risk: quarterlyData
        compliance: quarter
      {
        
     

        month: 'Aug',
        risk: quarterlyData.q3.por

      {
        exposure: quarte
       
      },
  }, [quarterlyDat
  const rad
      return ((value - min) / (max 

      {
        q2: 85,
      },
        metr
        q3:
      {
        q2: 76,
      },
        metric: 'Compliance',
        q3: normalize(qua
      {
        q2:
      },
  }, [quarterlyData])
  const formatValue = (value: number, format: string) => {
      case 'currency':
          style: 'currency
          no
        }).
        return `${value.toFixe
        return value.toFixed(2)
      default:
    }

    if (q2 =
  }
  const getChangeIndicator = (c
      return (
          {change >= 0 ? <TrendUp size={10} /> : <TrendDown 
        </Badge>
    }
    const is
    retur
        
      >
        {Math.abs(change).toFixed
    )

    const csvContent = generateCSVCon
    const url = URL.createObjectURL(blob)
    a.href = url
    document.body.appendChild
    document.body.removeCh
    
      descr
  }
  const generateCSVContent = () => {
    
      category.metrics.forEach
        const isPositive 
      })

  }
  return (
      <DialogContent className="max-w-7xl max-h-[90vh]
          <DialogTitle classNa
              <GitBranch s
            
          <
          </DialogDescription>

          <div className="flex items-center justify-between"
              <TabsTrigger va
                Side-by-Si
            
         
        
       
            </Button>

           
                <CardHeader classNam
                    <CardTitle className="flex items-center
                      Q2 2024
                    <Badge va
                </CardHea
            
           
                        {formatValue(qua
                    </div>
                      <p className="text-sm text-muted-foregroun
                        {quart
                    </div
            
           
                    </div>
                      <p className="text-sm text-muted-foregro
                        {quarterlyData.q2.portfolioMetrics.cov
                    </div>
                </CardCon

           
                    <CardTitle cla
                      Q3 2024 (Forecast)
                    <Badge variant="default">Jul - Sep</Badge
                </CardHeader>
                  <div cla
            
         
        
       
                        {quarterlyDa
                  
           
                        {quarterlyD
                    </div>
                      <p className="text-sm text-muted-foregr
                        {quar
                    </div>
            
           
            <Card>
                <CardTitle className="flex items-center gap-2
                  Performance Radar Comparison
              </CardHeader>
                <Responsi
            
           
                      name="Q2 2024"
                      stroke="oklch(0.45 0.02 250)" 
                      fillOpacity={0.3}
                    />
                      name
            
           
                    />
                    <Tooltip 
                        backgroundColor: 'oklch(1 0 0)', 
                        border
                    />
            
         
       
     

                  tra
                  <Ca

                    <CardContent>
            
       
                     
                              </div>
                                <div className="text-right min-w-24
                                  <p className="font-mono font-semi
                                  </p>
        
       
                     
                                    {formatValue(metric.q3, metric.format
                                </div>
                            </div>
                        })}
        
       
            </div>
            <Card className="border-accent/30 bg-accent/5">
                <div className="flex items-start gap-3">
                  <div className="space-y-2">
                    <ul className="space-y-1 text-sm text-muted-foregroun
        
       
                     
                      </li>
                        <span className="text-success mt-0.5">•</sp
                      </li>
                        <span className="text-success mt-0.5">•</span>
        
       
              </CardC
          </TabsContent>
          <TabsContent value="trends" className="space-y-6">
              <CardHeader>
                  <ChartLine size={20} className="text-accent" />
        
       
                  <Co
                      <linearGradient id="colorExposure" x1="0" y1
                        <stop offset="95%" stopColor="oklch(
                    </defs>
                    <XAxis dataKey="month" stroke="oklch(0.45 0.02 250)" 
        
     
                     

                    <Legend />
                      yAxisId="left"
                      dataKey="exposure"
     

            
       
                      dataKey="risk
               
               
        
       
                      stroke="oklc
               
               
        
       
                      strokeWidth=
               
               
        
       
            <div className="g
                <CardHeader>
                </CardHeader>
        
       
                        <span clas
               
               
        
     
                     

                  <div>
                    <
                      
                      </li>
                        <spa
                      </li
                        <span 
                      </li>
                  </div>
              </Card>
              <Card>
                  <Ca
                <CardContent>
                    
              
                      </div>
     
   

                        <span className="text-sm font-m
                      <div
                      </div>
   

                      </div>
                        <div cl
              
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono font-semibold"
                      <div className="h-
                
       
     

                  <CardTitle className="text-base flex items-center gap-2">
    
            
             
                    <Badge variant="outline">+15%</Badge>
                  <div className="flex items-center justify-between">
       
                  <div className="flex items-center justify-between">
                    <Badge variant="ou
              
     
   

                </CardContent>
            </div>
        </Tabs>
        <Separator />
        <div className="flex items-center
            Comp
          <Button variant="outline" onClick={() => onOpenChange(false)}>
          </Button>
      </Dialo
  )

  re
      <GitBranch size={20} />
    </Button>
}























































































































































































































































































































































































































































































